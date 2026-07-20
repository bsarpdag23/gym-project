import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

    if (member.gymId !== plan.gymId) {
      throw new BadRequestException('Bu paket sizin salonunuza ait değil.');
    }

    // ── YENİ: Zaten aktif üyeliği var mı? ──
    const now = new Date();
    const existingActive = await this.enrollRepo.findOne({
      where: {
        member: { id: userId },
        status: 'active',
      },
      order: { endDate: 'DESC' },
    });

    if (existingActive && new Date(existingActive.endDate) >= now) {
      throw new BadRequestException(
        `Zaten aktif bir üyeliğiniz var (bitiş: ${existingActive.endDate}). Yeni üyelik için mevcut üyeliğinizin bitmesini bekleyin.`,
      );
    }

    // ... geri kalan kod aynı (tarih hesabı, kaydetme) ...
    const startDate = new Date();
    const endDate   = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const enrollment = this.enrollRepo.create({
      member, plan, startDate, endDate,
      amountPaid: plan.price,
      status: 'active',
      gymId: member.gymId,
      totalPtSessions: plan.ptSessionsCount || 0,
      remainingPtSessions: plan.ptSessionsCount || 0,
    });
    return this.enrollRepo.save(enrollment);
  }

  // Süresi geçmiş 'active' üyelikleri 'expired' yap (lazy temizlik)
  async expireOldEnrollments() {
    const now = new Date();
    await this.enrollRepo
      .createQueryBuilder()
      .update()
      .set({ status: 'expired' })
      .where('status = :active', { active: 'active' })
      .andWhere('endDate < :now', { now })
      .execute();
  }

  async findAll(currentUser: any) {
    await this.expireOldEnrollments();   // ← önce temizle


    // Süper admin → tüm salonların üyelikleri; diğerleri → kendi salonu
    const where =
      currentUser.role === 'super_admin' ? {} : { gymId: currentUser.gymId };
    return this.enrollRepo.find({
      where,
      relations: { member: true, plan: true },
    });
  }

  async findByUser(userId: number) {
    await this.expireOldEnrollments();

    // Kullanıcı zaten kendi üyeliklerini görüyor — salon filtresi gereksiz
    return this.enrollRepo.find({
      where: { member: { id: userId } },
      relations: { plan: true },
    });
  }

  findOne(id: number) {
    return this.enrollRepo.findOne({
      where: { id },
      relations: { member: true, plan: true },
    });
  }

  async update(id: number, dto: UpdateEnrollmentDto, currentUser: any) {
    const enrollment = await this.enrollRepo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException('Üyelik bulunamadı');

    // Güvenlik: salon sahibi sadece kendi salonundaki üyeliği düzenleyebilir
    if (currentUser.role !== 'super_admin' && enrollment.gymId !== currentUser.gymId) {
      throw new BadRequestException('Bu üyelik sizin salonunuza ait değil.');
    }

    await this.enrollRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number, currentUser: any) {
    const enrollment = await this.enrollRepo.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException('Üyelik bulunamadı');

    if (currentUser.role !== 'super_admin' && enrollment.gymId !== currentUser.gymId) {
      throw new BadRequestException('Bu üyelik sizin salonunuza ait değil.');
    }

    await this.enrollRepo.delete(id);
    return { deleted: true };
  }

  async decrementPtSession(enrollmentId: number, trainerId: number, userRole: string) {
    const enrollment = await this.enrollRepo.findOne({
      where: { id: enrollmentId },
      relations: { member: true },
    });
    if (!enrollment) {
      throw new NotFoundException('Üyelik bulunamadı');
    }

    if (userRole === 'trainer' && enrollment.member.assignedTrainerId !== trainerId) {
      throw new BadRequestException('Bu üyenin PT seansını düşme yetkiniz yok (Atanmış antrenörü değilsiniz)');
    }

    if (enrollment.remainingPtSessions <= 0) {
      throw new BadRequestException('Üyenin kalan PT seansı kalmadı.');
    }

    enrollment.remainingPtSessions -= 1;
    return this.enrollRepo.save(enrollment);
  }
}