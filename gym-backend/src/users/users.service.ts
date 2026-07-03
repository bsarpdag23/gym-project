import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { FitnessProgram } from '../programs/entities/fitness-program.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
    @InjectRepository(FitnessProgram) private programRepo: Repository<FitnessProgram>,
  ) {}

  async findAll() {
    // Tüm kullanıcılar (trainer bilgisiyle)
    const users = await this.repo.find({
      select: {
        id: true, email: true, fullName: true,
        role: true, phone: true, isActive: true,
        assignedTrainerId: true,
      },
      relations: { assignedTrainer: true },
      order: { id: 'DESC' },
    });

    // PT'li aktif üyeliği olan üyelerin id'lerini tek sorguda çek
    const ptEnrollments = await this.enrollRepo.find({
      where: {
        status: 'active',
        plan: { includesPersonalTraining: true },
      },
      relations: { member: true },
    });
    const ptMemberIds = new Set(ptEnrollments.map((e) => e.member.id));

    // Her kullanıcıya hasActivePT bilgisini ekle
    return users.map((u) => ({
      ...u,
      hasActivePT: ptMemberIds.has(u.id),
    }));
  }

  // Sadece trainer rolündeki kullanıcılar (atama dropdown'u için)
  findTrainers() {
    return this.repo.find({
      where: { role: UserRole.TRAINER },
      select: { id: true, fullName: true, email: true },
    });
  }

  async updateRole(userId: number, role: string) {
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      throw new BadRequestException('Geçersiz rol.');
    }
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Kullanıcı bulunamadı.');
    user.role = role as UserRole;
    await this.repo.save(user);
    return { id: user.id, role: user.role };
  }

  // ── PT trainer atama (sıkı kural) ──
  async assignTrainer(memberId: number, trainerId: number | null) {
    const member = await this.repo.findOne({ where: { id: memberId } });
    if (!member) throw new BadRequestException('Üye bulunamadı.');

    // Atamayı kaldırma (trainerId null) → kontrole gerek yok
    if (trainerId === null) {
      member.assignedTrainerId = null;
      await this.repo.save(member);
      return { id: member.id, assignedTrainerId: null };
    }

    // Atanacak kişi gerçekten trainer mı?
    const trainer = await this.repo.findOne({ where: { id: trainerId } });
    if (!trainer || trainer.role !== UserRole.TRAINER) {
      throw new BadRequestException('Seçilen kişi bir trainer değil.');
    }

    // ── SIKI KURAL: üyenin PT'li aktif bir üyeliği var mı? ──
    const ptEnrollment = await this.enrollRepo.findOne({
      where: {
        member: { id: memberId },
        status: 'active',
        plan: { includesPersonalTraining: true },
      },
      relations: { plan: true },
    });

    if (!ptEnrollment) {
      throw new BadRequestException(
        'Bu üyenin PT içeren aktif bir üyeliği yok. Önce PT’li bir paket satın almalı.',
      );
    }

    member.assignedTrainerId = trainerId;
    await this.repo.save(member);
    return { id: member.id, assignedTrainerId: trainerId };
  }
  // Bir trainer'a atanmış üyeler + her birinin aktif fitness programı
  async findMyMembers(trainerId: number) {
    const members = await this.repo.find({
      where: { assignedTrainerId: trainerId },
      select: {
        id: true, fullName: true, email: true, phone: true,
      },
      order: { fullName: 'ASC' },
    });

    // Her üyenin aktif programını ekle
    const result: any[] = [];
    for (const m of members) {
      const activeProgram = await this.programRepo.findOne({
        where: { user: { id: m.id }, isActive: true },
      });
      result.push({ ...m, activeProgram: activeProgram || null });
    }
    return result;
  }
  // Giriş yapan kullanıcının kendi bilgisi (QR token dahil)
  findMe(userId: number) {
    return this.repo.findOne({
      where: { id: userId },
      select: {
        id: true, email: true, fullName: true, role: true, qrToken: true,
      },
    });
  }
}