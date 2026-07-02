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

  create(dto: CreateMembershipPlanDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() { return this.repo.find(); }

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