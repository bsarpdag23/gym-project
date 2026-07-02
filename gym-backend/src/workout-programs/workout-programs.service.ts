import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutProgram } from './entities/workout-program.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { User }     from '../users/entities/user.entity';
import { CreateWorkoutProgramDto } from './dto/create-workout-program.dto';
import { UpdateWorkoutProgramDto } from './dto/update-workout-program.dto';

@Injectable()
export class WorkoutProgramsService {
  constructor(
    @InjectRepository(WorkoutProgram) private programRepo: Repository<WorkoutProgram>,
    @InjectRepository(Exercise)       private exerciseRepo: Repository<Exercise>,
    @InjectRepository(User)           private userRepo:    Repository<User>,
  ) {}

  async create(dto: CreateWorkoutProgramDto, trainerId: number) {
    const trainer = await this.userRepo.findOne({ where: { id: trainerId } });
    if (!trainer) throw new NotFoundException('Trainer bulunamadı');

    const program = this.programRepo.create({
      name:        dto.name,
      description: dto.description,
      difficulty:  dto.difficulty,
      weeksCount:  dto.weeksCount,
      trainer,
    });
    return this.programRepo.save(program);
  }

  findAll() {
    return this.programRepo.find({ relations: { trainer: true, exercises: true } });
  }

  findOne(id: number) {
    return this.programRepo.findOne({ where: { id }, relations: { trainer: true, exercises: true } });
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
}