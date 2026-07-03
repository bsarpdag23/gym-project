import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { CheckIn } from '../check-ins/entities/check-in.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
    @InjectRepository(CheckIn) private checkInRepo: Repository<CheckIn>,
  ) {}

  async getStats() {
    // ── 1) Sayılar (count) ──
    const totalMembers = await this.userRepo.count({
      where: { role: UserRole.MEMBER },
    });

    const activeEnrollments = await this.enrollRepo.count({
      where: { status: 'active' },
    });

    // ── 2) Toplam gelir (sum) ──
    // count/find yerine queryBuilder ile SUM hesaplıyoruz
    const revenueResult = await this.enrollRepo
      .createQueryBuilder('e')
      .select('SUM(e.amountPaid)', 'total')
      .getRawOne();
    const totalRevenue = parseFloat(revenueResult.total) || 0;

    // ── 3) Bugünkü girişler ──
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // bugünün başlangıcı (00:00)
    const todayCheckIns = await this.checkInRepo.count({
      where: { checkInTime: MoreThanOrEqual(startOfToday) },
    });

    // ── 4) En popüler paketler (group by) ──
    const popularPlans = await this.enrollRepo
      .createQueryBuilder('e')
      .leftJoin('e.plan', 'plan')
      .select('plan.name', 'planName')
      .addSelect('COUNT(e.id)', 'count')
      .groupBy('plan.name')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    // ── 5) Rol dağılımı (group by) ──
    const roleDistribution = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(u.id)', 'count')
      .groupBy('u.role')
      .getRawMany();

    return {
      totalMembers,
      activeEnrollments,
      totalRevenue,
      todayCheckIns,
      popularPlans: popularPlans.map(p => ({ name: p.planName, count: parseInt(p.count) })),
      roleDistribution: roleDistribution.map(r => ({ role: r.role, count: parseInt(r.count) })),
    };
  }
}