import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HealthProfile } from '../health-profiles/entities/health-profile.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { FitnessProgram } from './entities/fitness-program.entity';
import { buildSummary, buildWorkoutPlan, ProfileInput, ExerciseLite } from './fitness-calculator';
import { AiProgramService } from './ai-program.service';
import { WorkoutProgram } from '../workout-programs/entities/workout-program.entity';
import { mapFocusToCategory } from '../workout-programs/program-category.util';
import { User } from '../users/entities/user.entity';

const GOAL_LABELS: Record<string, string> = { gain: 'kilo alma', lose: 'kilo verme', maintain: 'form koruma' };

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(HealthProfile) private profileRepo: Repository<HealthProfile>,
    @InjectRepository(Exercise) private exerciseRepo: Repository<Exercise>,
    @InjectRepository(FitnessProgram) private programRepo: Repository<FitnessProgram>,
    @InjectRepository(WorkoutProgram) private workoutProgramRepo: Repository<WorkoutProgram>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private aiProgramService: AiProgramService,
  ) {}

  // Üretilen haftalık planın her gününü, başka üyelerin görebileceği/değerlendirebileceği
  // kategorize edilmiş kataloga (WorkoutProgram) ekler. Gerçek DB id'si olmayan
  // egzersizler (ör. bazı AI çıktıları) sessizce atlanır.
  private async addToCatalog(userId: number, workoutPlan: any[], durationWeeks: number, goal: string, source: 'trainer' | 'ai') {
    for (const day of workoutPlan || []) {
      const exerciseIds = (day.exercises || []).map((e: any) => e.id).filter((id: any) => Number.isInteger(id));
      if (!exerciseIds.length) continue;
      const exercises = await this.exerciseRepo.findBy({ id: In(exerciseIds) });
      if (!exercises.length) continue;

      const catalogProgram = this.workoutProgramRepo.create({
        name: day.focus,
        description: `Yapay zeka tarafından ${GOAL_LABELS[goal] || goal} hedefine göre oluşturuldu.`,
        difficulty: 'orta',
        weeksCount: durationWeeks,
        category: mapFocusToCategory(day.focus),
        source,
        author: { id: userId } as any,
        exercises,
      });
      await this.workoutProgramRepo.save(catalogProgram);
    }
  }

  // Profili çekip, hesaplama fonksiyonlarının beklediği tipe dönüştürür
  private async getProfileInput(userId: number): Promise<{ profile: HealthProfile; input: ProfileInput }> {
    const profile = await this.profileRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      throw new BadRequestException('Önce sağlık profilinizi oluşturmalısınız.');
    }
    const input: ProfileInput = {
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      age: profile.age,
      gender: profile.gender,
      targetWeightKg: profile.targetWeightKg,
      activityLevel: profile.activityLevel,
    };
    return { profile, input };
  }

  // Sadece hesap özeti (kaydetmez)
  async preview(userId: number) {
    const { input } = await this.getProfileInput(userId);
    return buildSummary(input);
  }

  // Program üret + kaydet (eski aktifleri pasife çeker)
  async generate(userId: number) {
    const { profile, input } = await this.getProfileInput(userId);
    const summary = buildSummary(input);

    // Egzersizleri çek, saf fonksiyona uygun tipe indirge
    const allExercises = await this.exerciseRepo.find();
    const exLite: ExerciseLite[] = allExercises.map((e) => ({
      id: e.id, name: e.name, muscleGroup: e.muscleGroup, goalType: e.goalType,
      sets: e.sets, reps: e.reps, equipment: e.equipment,
    }));

   

    const workoutPlan = buildWorkoutPlan(exLite, summary.goal, profile.weeklyWorkoutDays);
    

    // Tarihleri hesapla
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + summary.durationWeeks * 7);

    // Eski aktif programları pasife çek (geçmişte kalsın)
    await this.programRepo.update(
      { user: { id: userId }, isActive: true },
      { isActive: false },
    );

    // Yeni programı oluştur
    const program = this.programRepo.create({
      user: { id: userId } as any,
      goal: summary.goal,
      startWeightKg: input.weightKg,
      targetWeightKg: input.targetWeightKg,
      durationWeeks: summary.durationWeeks,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      dailyCalories: summary.targetCalories,
      proteinG: summary.macros.proteinG,
      fatG: summary.macros.fatG,
      carbsG: summary.macros.carbsG,
      workoutPlan,
      warnings: summary.warnings,
      isActive: true,
    });
    const saved = await this.programRepo.save(program);

    try {
      await this.addToCatalog(userId, workoutPlan, summary.durationWeeks, summary.goal, 'ai');
    } catch (err) {
      console.error('🔴 Katalog ekleme hatası:', err.message);
    }

    return saved;
  }

  // AI ile program üret (başarısız olursa kural tabanlıya düşer)
  async generateWithAI(userId: number) {
    const { profile, input } = await this.getProfileInput(userId);
    const summary = buildSummary(input);

    let workoutPlan;
    let source = 'ai';
    try {
      // AI'dan antrenman planı iste
      workoutPlan = await this.aiProgramService.generateWorkoutPlan(
        input, summary.goal, profile.weeklyWorkoutDays,
      );
    } catch (err) {
      console.error('🔴 AI HATASI:', err.message);   // ← geçici, hatayı görmek için
      // AI başarısız → kural tabanlı yedek
      const allExercises = await this.exerciseRepo.find();
      const exLite = allExercises.map((e) => ({
        id: e.id, name: e.name, muscleGroup: e.muscleGroup, goalType: e.goalType,
        sets: e.sets, reps: e.reps, equipment: e.equipment,
      }));
      workoutPlan = buildWorkoutPlan(exLite, summary.goal, profile.weeklyWorkoutDays);
      source = 'rule-based-fallback';
    }

    // Tarihler
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + summary.durationWeeks * 7);

    // Eski aktifleri pasife çek
    await this.programRepo.update(
      { user: { id: userId }, isActive: true },
      { isActive: false },
    );

    // Kaydet (diyet hedefleri yine hesap motorundan, antrenman AI'dan)
    const program = this.programRepo.create({
      user: { id: userId } as any,
      goal: summary.goal,
      startWeightKg: input.weightKg,
      targetWeightKg: input.targetWeightKg,
      durationWeeks: summary.durationWeeks,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      dailyCalories: summary.targetCalories,
      proteinG: summary.macros.proteinG,
      fatG: summary.macros.fatG,
      carbsG: summary.macros.carbsG,
      workoutPlan,
      warnings: summary.warnings,
      isActive: true,
    });
    const saved = await this.programRepo.save(program);

    try {
      await this.addToCatalog(userId, workoutPlan, summary.durationWeeks, summary.goal, 'ai');
    } catch (err) {
      console.error('🔴 Katalog ekleme hatası:', err.message);
    }

    return { ...saved, source };   // source: hangi yöntemle üretildi (ai / fallback)
  }

  // AI ile detaylı diyet listesi oluştur ve kaydet
  async generateDietPlanWithAI(userId: number) {
    const activeProgram = await this.programRepo.findOne({
      where: { user: { id: userId }, isActive: true },
    });
    if (!activeProgram) {
      throw new BadRequestException('Aktif bir program bulunamadı. Önce antrenman/diyet hedeflerinizi oluşturmalısınız.');
    }

    const { input } = await this.getProfileInput(userId);

    const dietPlan = await this.aiProgramService.generateDietPlan(
      input,
      activeProgram.goal,
      activeProgram.dailyCalories,
      {
        proteinG: activeProgram.proteinG,
        carbsG: activeProgram.carbsG,
        fatG: activeProgram.fatG,
      }
    );

    activeProgram.dietPlan = dietPlan;
    return this.programRepo.save(activeProgram);
  }

  // Aktif program
  findActive(userId: number) {
    return this.programRepo.findOne({
      where: { user: { id: userId }, isActive: true },
    });
  }

  // Tüm programlar (geçmiş dahil, yeniden eskiye)
  findAll(userId: number) {
    return this.programRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async activateCatalogProgram(userId: number, workoutProgramId: number, gymId: number | null) {
    const catalogProgram = await this.workoutProgramRepo.findOne({
      where: { id: workoutProgramId },
      relations: { exercises: true },
    });
    if (!catalogProgram) {
      throw new NotFoundException('Katalog programı bulunamadı');
    }

    const { profile, input } = await this.getProfileInput(userId);
    const summary = buildSummary(input);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + catalogProgram.weeksCount * 7);

    // Eski aktif programları pasife çek
    await this.programRepo.update(
      { user: { id: userId }, isActive: true },
      { isActive: false },
    );

    // Egzersizleri ExerciseLite tipine indirge
    const exercisesLite = (catalogProgram.exercises || []).map((e) => ({
      id: e.id,
      name: e.name,
      muscleGroup: e.muscleGroup,
      goalType: e.goalType,
      sets: e.sets,
      reps: e.reps,
      equipment: e.equipment,
    }));

    const workoutPlan = [
      {
        day: 1,
        focus: catalogProgram.name,
        exercises: exercisesLite,
      },
    ];

    // Yeni fitness programını oluştur ve kaydet
    const fitnessProgram = this.programRepo.create({
      user: { id: userId } as any,
      goal: summary.goal,
      startWeightKg: input.weightKg,
      targetWeightKg: input.targetWeightKg,
      durationWeeks: catalogProgram.weeksCount,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      dailyCalories: summary.targetCalories,
      proteinG: summary.macros.proteinG,
      fatG: summary.macros.fatG,
      carbsG: summary.macros.carbsG,
      workoutPlan,
      warnings: summary.warnings,
      isActive: true,
      gymId,
    });

    return this.programRepo.save(fitnessProgram);
  }

  async assignProgram(trainerId: number, memberId: number, workoutProgramId: number) {
    const member = await this.userRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException('Üye bulunamadı');
    }

    const trainer = await this.userRepo.findOne({ where: { id: trainerId } });
    if (!trainer) {
      throw new NotFoundException('Antrenör bulunamadı');
    }

    if (trainer.role === 'trainer' && member.assignedTrainerId !== trainerId) {
      throw new BadRequestException('Bu üyeye program atama yetkiniz yok (PT antrenörü değilsiniz)');
    }

    const catalogProgram = await this.workoutProgramRepo.findOne({
      where: { id: workoutProgramId },
      relations: { exercises: true },
    });
    if (!catalogProgram) {
      throw new NotFoundException('Katalog programı bulunamadı');
    }

    const { profile, input } = await this.getProfileInput(memberId);
    const summary = buildSummary(input);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + catalogProgram.weeksCount * 7);

    // Eski aktif programları pasife çek
    await this.programRepo.update(
      { user: { id: memberId }, isActive: true },
      { isActive: false },
    );

    // Egzersizleri ExerciseLite tipine indirge
    const exercisesLite = (catalogProgram.exercises || []).map((e) => ({
      id: e.id,
      name: e.name,
      muscleGroup: e.muscleGroup,
      goalType: e.goalType,
      sets: e.sets,
      reps: e.reps,
      equipment: e.equipment,
    }));

    const workoutPlan = [
      {
        day: 1,
        focus: catalogProgram.name,
        exercises: exercisesLite,
      },
    ];

    // Yeni fitness programını oluştur ve kaydet
    const fitnessProgram = this.programRepo.create({
      user: { id: memberId } as any,
      goal: summary.goal,
      startWeightKg: input.weightKg,
      targetWeightKg: input.targetWeightKg,
      durationWeeks: catalogProgram.weeksCount,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      dailyCalories: summary.targetCalories,
      proteinG: summary.macros.proteinG,
      fatG: summary.macros.fatG,
      carbsG: summary.macros.carbsG,
      workoutPlan,
      warnings: summary.warnings,
      isActive: true,
      gymId: member.gymId,
    });

    return this.programRepo.save(fitnessProgram);
  }
}