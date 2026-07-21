import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { join } from 'path';
import { mkdir, unlink } from 'fs/promises';
import sharp from 'sharp';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { FitnessProgram } from '../programs/entities/fitness-program.entity';
import { CheckIn } from '../check-ins/entities/check-in.entity';

const AVATAR_DIR = join(__dirname, '..', '..', 'uploads', 'avatars');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
    @InjectRepository(FitnessProgram) private programRepo: Repository<FitnessProgram>,
    @InjectRepository(CheckIn) private checkInRepo: Repository<CheckIn>,
  ) {}

  async findAll(currentUser: any) {
    // Süper admin → tüm salonların kullanıcıları; salon sahibi → sadece kendi salonu
    const baseWhere =
      currentUser.role === 'super_admin'
        ? { role: Not(UserRole.SUPER_ADMIN) }
        : { gymId: currentUser.gymId, role: Not(UserRole.SUPER_ADMIN) };

    const users = await this.repo.find({
      where: baseWhere,
      select: {
        id: true, email: true, fullName: true,
        role: true, phone: true, isActive: true,
        assignedTrainerId: true,
      },
      relations: { assignedTrainer: true },
      order: { id: 'DESC' },
    });

    // PT'li aktif üyeliği olan üyelerin id'lerini çek (aynı salon kapsamında)
    const ptEnrollments = await this.enrollRepo.find({
      where: {
        status: 'active',
        plan: { includesPersonalTraining: true },
      },
      relations: { member: true },
    });
    const ptMemberIds = new Set(ptEnrollments.map((e) => e.member.id));

    return users.map((u) => ({
      ...u,
      hasActivePT: ptMemberIds.has(u.id),
    }));
  }

  // Sadece trainer rolündeki kullanıcılar — kendi salonundan
  findTrainers(currentUser: any) {
    const where: any = { role: UserRole.TRAINER };
    if (currentUser.role !== 'super_admin') {
      where.gymId = currentUser.gymId;
    }
    return this.repo.find({
      where,
      select: { id: true, fullName: true, email: true },
    });
  }

  async updateRole(userId: number, role: string, currentUser: any) {
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      throw new BadRequestException('Geçersiz rol.');
    }
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Kullanıcı bulunamadı.');

    // Güvenlik: salon sahibi sadece kendi salonundaki kullanıcının rolünü değiştirebilir
    if (currentUser.role !== 'super_admin' && user.gymId !== currentUser.gymId) {
      throw new BadRequestException('Bu kullanıcı sizin salonunuza ait değil.');
    }

    user.role = role as UserRole;
    await this.repo.save(user);
    return { id: user.id, role: user.role };
  }

  async assignTrainer(memberId: number, trainerId: number | null, currentUser: any) {
    const member = await this.repo.findOne({ where: { id: memberId } });
    if (!member) throw new BadRequestException('Üye bulunamadı.');

    // Güvenlik: üye, çağıran kişinin salonuna ait mi?
    if (currentUser.role !== 'super_admin' && member.gymId !== currentUser.gymId) {
      throw new BadRequestException('Bu üye sizin salonunuza ait değil.');
    }

    if (trainerId === null) {
      member.assignedTrainerId = null;
      await this.repo.save(member);
      return { id: member.id, assignedTrainerId: null };
    }

    const trainer = await this.repo.findOne({ where: { id: trainerId } });
    if (!trainer || trainer.role !== UserRole.TRAINER) {
      throw new BadRequestException('Seçilen kişi bir trainer değil.');
    }

    // Güvenlik: trainer da aynı salondan olmalı
    if (currentUser.role !== 'super_admin' && trainer.gymId !== currentUser.gymId) {
      throw new BadRequestException('Bu trainer sizin salonunuza ait değil.');
    }

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

  async findMyMembers(trainerId: number) {
    // trainerId zaten çağıran trainer'ın kendi id'si (controller req.user'dan verir)
    // ve trainer kendi salonundaki üyelere atanmış olduğu için ekstra salon filtresi gerekmez
    const members = await this.repo.find({
      where: { assignedTrainerId: trainerId },
      select: {
        id: true, fullName: true, email: true, phone: true,
      },
      order: { fullName: 'ASC' },
    });

    const result: any[] = [];
    for (const m of members) {
      const activeProgram = await this.programRepo.findOne({
        where: { user: { id: m.id }, isActive: true },
      });
      const activeEnrollment = await this.enrollRepo.findOne({
        where: { member: { id: m.id }, status: 'active' },
        relations: { plan: true },
      });
      if (activeEnrollment && activeEnrollment.totalPtSessions === 0 && activeEnrollment.plan?.ptSessionsCount > 0) {
        activeEnrollment.totalPtSessions = activeEnrollment.plan.ptSessionsCount;
        activeEnrollment.remainingPtSessions = activeEnrollment.plan.ptSessionsCount;
        await this.enrollRepo.save(activeEnrollment);
      }
      result.push({
        ...m,
        activeProgram: activeProgram || null,
        activeEnrollment: activeEnrollment || null,
      });
    }
    return result;
  }

  findMe(userId: number) {
    return this.repo.findOne({
      where: { id: userId },
      select: {
        id: true, email: true, fullName: true, role: true, qrToken: true,
        hideProfile: true, avatarUrl: true,
      },
    });
  }

  async updatePrivacy(userId: number, hideProfile: boolean) {
    await this.repo.update(userId, { hideProfile });
    return { id: userId, hideProfile };
  }

  async uploadAvatar(userId: number, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Dosya bulunamadı.');
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Sadece resim dosyaları yüklenebilir.');
    }

    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Kullanıcı bulunamadı.');

    await mkdir(AVATAR_DIR, { recursive: true });

    const filename = `${userId}-${Date.now()}.webp`;
    const filePath = join(AVATAR_DIR, filename);

    // Boyutlandır, kırp ve WebP'ye çevir — hem tutarlı görünüm hem küçük dosya boyutu sağlar
    await sharp(file.buffer)
      .resize(256, 256, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(filePath);

    const oldAvatarUrl = user.avatarUrl;
    const avatarUrl = `/uploads/avatars/${filename}`;
    await this.repo.update(userId, { avatarUrl });

    if (oldAvatarUrl) {
      const oldPath = join(__dirname, '..', '..', oldAvatarUrl);
      unlink(oldPath).catch(() => {}); // eski dosya silinemezse görmezden gel
    }

    return { id: userId, avatarUrl };
  }

  async getGamification(userId: number) {
    const user = await this.repo.findOne({
      where: { id: userId },
      select: {
        id: true, fullName: true, points: true, badges: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı.');
    }

    const checkInCount = await this.checkInRepo.count({ where: { member: { id: user.id } } });

    return {
      userId: user.id,
      fullName: user.fullName,
      points: user.points || 0,
      badges: user.badges || [],
      checkInCount,
    };
  }
}