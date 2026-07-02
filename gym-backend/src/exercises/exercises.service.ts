import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise) private repo: Repository<Exercise>,
  ) {}

  create(dto: CreateExerciseDto) { return this.repo.save(this.repo.create(dto)); }

  findAll() { return this.repo.find(); }

  findOne(id: number) { return this.repo.findOne({ where: { id } }); }

  async update(id: number, dto: UpdateExerciseDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}