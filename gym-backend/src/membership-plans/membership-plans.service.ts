import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipPlan } from './entities/membership-plan.entity';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';

@Injectable()
export class MembershipPlansService {
  constructor(
    @InjectRepository(MembershipPlan) private repo: Repository<MembershipPlan>,
  ) {}

  create(dto: CreateMembershipPlanDto, user: any) {
  const plan = this.repo.create({ ...dto, gymId: user.gymId });  // ← salona bağla
  return this.repo.save(plan);
}

 findAll(user: any) {
  if (user.role === 'super_admin') {
    return this.repo.find();   // süper admin tüm salonların paketlerini görür
  }
  return this.repo.find({ where: { gymId: user.gymId } });
}

  findOne(id: number) { return this.repo.findOne({ where: { id } }); }

  async update(id: number, dto: UpdateMembershipPlanDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}