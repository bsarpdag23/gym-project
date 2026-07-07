import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CheckIn } from './entities/check-in.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';

@Injectable()
export class CheckInsService {
  constructor(
    @InjectRepository(CheckIn) private checkInRepo: Repository<CheckIn>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
  ) {}

  // QR token okutulunca giriş kontrolü + kaydı
  async checkIn(qrToken: string, currentUser: any) {
    // 1) Token kimin?
    const member = await this.userRepo.findOne({ where: { qrToken } });
    if (!member) {
      throw new NotFoundException('Geçersiz QR kod. Üye bulunamadı.');
    }

    // Güvenlik: görevli sadece kendi salonundaki üyeyi içeri alabilir
    if (currentUser.role !== 'super_admin' && member.gymId !== currentUser.gymId) {
      throw new BadRequestException('Bu üye sizin salonunuza ait değil.');
    }

    // 2) Aktif (süresi geçmemiş) üyeliği var mı?
    const now = new Date();
    const activeEnrollment = await this.enrollRepo.findOne({
      where: {
        member: { id: member.id },
        status: 'active',
      },
      relations: { plan: true },
      order: { endDate: 'DESC' },
    });

    if (!activeEnrollment) {
      throw new BadRequestException(
        `${member.fullName}: Aktif üyeliğiniz yok. Girişe izin verilmedi.`,
      );
    }

    if (new Date(activeEnrollment.endDate) < now) {
      throw new BadRequestException(
        `${member.fullName}: Üyeliğinizin süresi dolmuş (${activeEnrollment.endDate}). Girişe izin verilmedi.`,
      );
    }

    // 3) Giriş kaydı oluştur (salona bağlı)
    const checkIn = this.checkInRepo.create({ member, gymId: member.gymId });
    await this.checkInRepo.save(checkIn);

    return {
      success: true,
      message: `Hoş geldin, ${member.fullName}! 🎉`,
      memberName: member.fullName,
      plan: activeEnrollment.plan?.name,
      validUntil: activeEnrollment.endDate,
      checkInTime: checkIn.checkInTime,
    };
  }

  // Giriş kayıtları — salona göre filtreli
  findAll(currentUser: any) {
    const where =
      currentUser.role === 'super_admin' ? {} : { gymId: currentUser.gymId };
    return this.checkInRepo.find({
      where,
      relations: { member: true },
      order: { checkInTime: 'DESC' },
    });
  }

  // Bir kerelik: eski kullanıcılara token üret
  async backfillTokens() {
    const { randomBytes } = await import('crypto');
    const usersWithoutToken = await this.userRepo.find({ where: { qrToken: IsNull() } });
    for (const u of usersWithoutToken) {
      u.qrToken = randomBytes(16).toString('hex');
      await this.userRepo.save(u);
    }
    return { updated: usersWithoutToken.length };
  }
}