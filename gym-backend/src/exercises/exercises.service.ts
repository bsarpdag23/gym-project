import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  create(dto: CreateExerciseDto, currentUser: any) {
    // Egzersiz, oluşturanın salonuna bağlanır
    return this.repo.save(this.repo.create({ ...dto, gymId: currentUser.gymId }));
  }

  findAll(currentUser: any) {
    if (currentUser.role === 'super_admin') return this.repo.find();
    return this.repo.find({ where: { gymId: currentUser.gymId } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateExerciseDto, currentUser: any) {
    const exercise = await this.repo.findOne({ where: { id } });
    if (!exercise) throw new NotFoundException('Egzersiz bulunamadı');

    if (currentUser.role !== 'super_admin' && exercise.gymId !== currentUser.gymId) {
      throw new BadRequestException('Bu egzersiz sizin salonunuza ait değil.');
    }

    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number, currentUser: any) {
    const exercise = await this.repo.findOne({ where: { id } });
    if (!exercise) throw new NotFoundException('Egzersiz bulunamadı');

    if (currentUser.role !== 'super_admin' && exercise.gymId !== currentUser.gymId) {
      throw new BadRequestException('Bu egzersiz sizin salonunuza ait değil.');
    }

    await this.repo.delete(id);
    return { deleted: true };
  }
}