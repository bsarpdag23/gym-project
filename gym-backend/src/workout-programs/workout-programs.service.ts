import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutProgram } from './entities/workout-program.entity';
import { ProgramRating } from './entities/program-rating.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { User }     from '../users/entities/user.entity';
import { CreateWorkoutProgramDto } from './dto/create-workout-program.dto';
import { UpdateWorkoutProgramDto } from './dto/update-workout-program.dto';
import { RateProgramDto } from './dto/rate-program.dto';

@Injectable()
export class WorkoutProgramsService {
  constructor(
    @InjectRepository(WorkoutProgram) private programRepo: Repository<WorkoutProgram>,
    @InjectRepository(ProgramRating)  private ratingRepo:  Repository<ProgramRating>,
    @InjectRepository(Exercise)       private exerciseRepo: Repository<Exercise>,
    @InjectRepository(User)           private userRepo:    Repository<User>,
  ) {}

  async create(dto: CreateWorkoutProgramDto, authorId: number) {
    const author = await this.userRepo.findOne({ where: { id: authorId } });
    if (!author) throw new NotFoundException('Kullanıcı bulunamadı');

    const program = this.programRepo.create({
      name:        dto.name,
      description: dto.description,
      difficulty:  dto.difficulty,
      weeksCount:  dto.weeksCount,
      category:    dto.category,
      source:      'trainer',
      author,
    });
    return this.programRepo.save(program);
  }

  private async withRatingSummaries(programs: WorkoutProgram[]) {
    return programs.map((p) => {
      const ratings = p.ratings || [];
      const avgRating = ratings.length
        ? +(ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : null;
      return { ...p, avgRating, ratingCount: ratings.length };
    });
  }

  private readonly listSelect = {
    id: true, name: true, description: true, difficulty: true, weeksCount: true,
    isActive: true, category: true, source: true,
    author: { id: true, fullName: true } as any,
    exercises: true as any,
    ratings: {
      id: true, rating: true, comment: true, createdAt: true,
      user: { id: true, fullName: true } as any,
    } as any,
  };

  async findAll() {
    const programs = await this.programRepo.find({
      relations: { author: true, exercises: true, ratings: { user: true } },
      select: this.listSelect as any,
    });
    return this.withRatingSummaries(programs);
  }

  async findOne(id: number) {
    const program = await this.programRepo.findOne({
      where: { id },
      relations: { author: true, exercises: true, ratings: { user: true } },
      select: this.listSelect as any,
    });
    if (!program) return null;
    const [withSummary] = await this.withRatingSummaries([program]);
    return withSummary;
  }

  async update(id: number, dto: UpdateWorkoutProgramDto) {
    await this.programRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.programRepo.delete(id);
    return { deleted: true };
  }

  async addExercise(programId: number, exerciseId: number) {
    const program  = await this.programRepo.findOne({ where: { id: programId }, relations: { exercises: true } });
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });

    if (!program)  throw new NotFoundException('Program bulunamadı');
    if (!exercise) throw new NotFoundException('Egzersiz bulunamadı');

    if (!program.exercises) program.exercises = [];
    program.exercises.push(exercise);
    return this.programRepo.save(program);
  }

  async removeExercise(programId: number, exerciseId: number) {
    const program = await this.programRepo.findOne({ where: { id: programId }, relations: { exercises: true } });
    if (!program) throw new NotFoundException('Program bulunamadı');

    program.exercises = program.exercises.filter((e) => e.id !== exerciseId);
    return this.programRepo.save(program);
  }

  async rate(programId: number, userId: number, dto: RateProgramDto) {
    const program = await this.programRepo.findOne({ where: { id: programId } });
    if (!program) throw new NotFoundException('Program bulunamadı');

    const existing = await this.ratingRepo.findOne({
      where: { program: { id: programId }, user: { id: userId } },
    });

    if (existing) {
      existing.rating = dto.rating;
      existing.comment = dto.comment ?? null;
      await this.ratingRepo.save(existing);
    } else {
      const created = this.ratingRepo.create({
        program: { id: programId } as any,
        user: { id: userId } as any,
        rating: dto.rating,
        comment: dto.comment,
      });
      await this.ratingRepo.save(created);
    }

    return this.findOne(programId);
  }
}
