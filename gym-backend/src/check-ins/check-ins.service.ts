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
  async checkIn(qrToken: string) {
    // 1) Token kimin?
    const member = await this.userRepo.findOne({ where: { qrToken } });
    if (!member) {
      throw new NotFoundException('Geçersiz QR kod. Üye bulunamadı.');
    }

    // 2) Aktif (süresi geçmemiş) üyeliği var mı?
    const now = new Date();
    const activeEnrollment = await this.enrollRepo.findOne({
      where: {
        member: { id: member.id },
        status: 'active',
      },
      relations: { plan: true },
      order: { endDate: 'DESC' }, // en güncel biten üyelik
    });

    if (!activeEnrollment) {
      throw new BadRequestException(
        `${member.fullName}: Aktif üyeliğiniz yok. Girişe izin verilmedi.`,
      );
    }

    // Üyelik süresi dolmuş mu? (endDate geçmiş mi)
    if (new Date(activeEnrollment.endDate) < now) {
      throw new BadRequestException(
        `${member.fullName}: Üyeliğinizin süresi dolmuş (${activeEnrollment.endDate}). Girişe izin verilmedi.`,
      );
    }

    // 3) Giriş kaydı oluştur
    const checkIn = this.checkInRepo.create({ member });
    await this.checkInRepo.save(checkIn);

    // 4) Başarılı sonucu dön
    return {
      success: true,
      message: `Hoş geldin, ${member.fullName}! 🎉`,
      memberName: member.fullName,
      plan: activeEnrollment.plan?.name,
      validUntil: activeEnrollment.endDate,
      checkInTime: checkIn.checkInTime,
    };
  }

  // Tüm giriş kayıtları (admin için, en yeni önce)
  findAll() {
    return this.checkInRepo.find({
      relations: { member: true },
      order: { checkInTime: 'DESC' },
    });
  }

  // Mevcut token'sız kullanıcılara toplu token üret (bir kerelik yardımcı)
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