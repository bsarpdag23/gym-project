import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { User } from '../users/entities/user.entity';
import { MembershipPlan } from '../membership-plans/entities/membership-plan.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)  private enrollRepo: Repository<Enrollment>,
    @InjectRepository(User)        private userRepo:   Repository<User>,
    @InjectRepository(MembershipPlan) private planRepo: Repository<MembershipPlan>,
  ) {}

  async create(dto: CreateEnrollmentDto, userId: number) {
    const member = await this.userRepo.findOne({ where: { id: userId } });
    const plan   = await this.planRepo.findOne({ where: { id: dto.planId } });

    if (!member) throw new NotFoundException('Kullanıcı bulunamadı');
    if (!plan)   throw new NotFoundException('Plan bulunamadı');

    const startDate = new Date();
    const endDate   = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const enrollment = this.enrollRepo.create({
      member, plan, startDate, endDate,
      amountPaid: plan.price,
      status: 'active',
    });
    return this.enrollRepo.save(enrollment);
  }

  findAll() {
    return this.enrollRepo.find({ 
  relations: { member: true, plan: true } 
});
  }

  findByUser(userId: number) {
    return this.enrollRepo.find({
      where: { member: { id: userId } },
    relations: { plan: true },
    });
  }

  findOne(id: number) {
    return this.enrollRepo.findOne({ 
  where: { id }, 
  relations: { member: true, plan: true } 
});
  }

  async update(id: number, dto: UpdateEnrollmentDto) {
    await this.enrollRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.enrollRepo.delete(id);
    return { deleted: true };
  }
}
