import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gym } from './entities/gym.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { CheckIn } from '../check-ins/entities/check-in.entity';
import { MoreThanOrEqual } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GymsService {
  constructor(
    @InjectRepository(Gym) private gymRepo: Repository<Gym>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Enrollment) private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(CheckIn) private checkInRepo: Repository<CheckIn>,
  ) {}

  // Tüm salonlar (süper admin görür)
  findAll() {
    return this.gymRepo.find({ order: { createdAt: 'DESC' } });
  }

  // Halka açık aktif salon listesi (kayıt olma ekranı için)
  findPublicList() {
    return this.gymRepo.find({
      where: { isActive: true },
      select: { id: true, name: true, address: true },
      order: { name: 'ASC' },
    });
  }

  // Yeni salon oluştur + sahibini (admin) oluştur
  async create(data: {
    name: string; address?: string; phone?: string;
    ownerEmail: string; ownerName: string; ownerPassword: string;
  }) {
    // Bu email zaten var mı?
    const existing = await this.userRepo.findOne({ where: { email: data.ownerEmail } });
    if (existing) throw new BadRequestException('Bu e-posta zaten kayıtlı.');

    // 1) Salonu oluştur
    const gym = await this.gymRepo.save(
      this.gymRepo.create({ name: data.name, address: data.address, phone: data.phone }),
    );

    // 2) Salon sahibini (admin) oluştur, bu salona bağla
    const hashed = await bcrypt.hash(data.ownerPassword, 10);
    const owner = this.userRepo.create({
      email: data.ownerEmail,
      fullName: data.ownerName,
      password: hashed,
      role: UserRole.ADMIN,   // salon sahibi = admin
      gymId: gym.id,          // bu salona bağlı
    });
    await this.userRepo.save(owner);

    return { gym, owner: { id: owner.id, email: owner.email, fullName: owner.fullName } };
  }
  // Belirli bir salonun detayı + istatistikleri (süper admin için)
  async getGymDetail(gymId: number) {
    const gym = await this.gymRepo.findOne({ where: { id: gymId } });
    if (!gym) throw new NotFoundException('Salon bulunamadı.');

    // O salonun istatistikleri
    const totalMembers = await this.userRepo.count({
      where: { gymId, role: UserRole.MEMBER },
    });
    const activeEnrollments = await this.enrollmentRepo.count({
      where: { gymId, status: 'active' },
    });

    const revenueResult = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('SUM(e.amountPaid)', 'total')
      .where('e.gymId = :gymId', { gymId })
      .getRawOne();
    const totalRevenue = parseFloat(revenueResult.total) || 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayCheckIns = await this.checkInRepo.count({
      where: { gymId, checkInTime: MoreThanOrEqual(startOfToday) },
    });

    return {
      gym,
      stats: { totalMembers, activeEnrollments, totalRevenue, todayCheckIns },
    };
  }

  // Belirli bir salonun kullanıcıları (süper admin için)
  getGymUsers(gymId: number) {
    return this.userRepo.find({
      where: { gymId },
      select: { id: true, fullName: true, email: true, role: true, phone: true, isActive: true },
      order: { role: 'ASC', id: 'DESC' },
    });
  }

  // Salon bilgilerini ve durumunu güncelle (süper admin)
  async update(id: number, data: { name?: string; address?: string; phone?: string; isActive?: boolean }) {
    const gym = await this.gymRepo.findOne({ where: { id } });
    if (!gym) throw new NotFoundException('Salon bulunamadı.');
    Object.assign(gym, data);
    return this.gymRepo.save(gym);
  }

  // Salon sil (süper admin)
  async remove(id: number) {
    const gym = await this.gymRepo.findOne({ where: { id } });
    if (!gym) throw new NotFoundException('Salon bulunamadı.');
    
    // Yabancı anahtar kısıtlamalarını önlemek için bu salondaki kullanıcıların gymId değerini null yapalım
    await this.userRepo.update({ gymId: id }, { gymId: null });
    
    await this.gymRepo.delete(id);
    return { success: true };
  }

  // Platform genelindeki istatistikler (süper admin)
  async getGlobalStats() {
    const totalGyms = await this.gymRepo.count();
    const totalMembers = await this.userRepo.count({
      where: { role: UserRole.MEMBER },
    });
    const activeEnrollments = await this.enrollmentRepo.count({
      where: { status: 'active' },
    });

    const revenueResult = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('SUM(e.amountPaid)', 'total')
      .getRawOne();
    const totalRevenue = parseFloat(revenueResult.total) || 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayCheckIns = await this.checkInRepo.count({
      where: { checkInTime: MoreThanOrEqual(startOfToday) },
    });

    return {
      totalGyms,
      totalMembers,
      activeEnrollments,
      totalRevenue,
      todayCheckIns,
    };
  }
}