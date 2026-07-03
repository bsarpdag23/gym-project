import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthProfile } from '../health-profiles/entities/health-profile.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { FitnessProgram } from './entities/fitness-program.entity';
import { buildSummary, buildWorkoutPlan, ProfileInput, ExerciseLite } from './fitness-calculator';
import { AiProgramService } from './ai-program.service';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(HealthProfile) private profileRepo: Repository<HealthProfile>,
    @InjectRepository(Exercise) private exerciseRepo: Repository<Exercise>,
    @InjectRepository(FitnessProgram) private programRepo: Repository<FitnessProgram>,
    private aiProgramService: AiProgramService,
  ) {}

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
    return this.programRepo.save(program);
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
    return { ...saved, source };   // source: hangi yöntemle üretildi (ai / fallback)
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
}