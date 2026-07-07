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

  async getStats(currentUser: any) {
    const isSuper = currentUser.role === 'super_admin';
    const gymId = currentUser.gymId;

    // ── 1) Toplam üye (count) ──
    const totalMembers = await this.userRepo.count({
      where: isSuper
        ? { role: UserRole.MEMBER }
        : { role: UserRole.MEMBER, gymId },
    });

    // ── 2) Aktif üyelik (count) ──
    const activeEnrollments = await this.enrollRepo.count({
      where: isSuper
        ? { status: 'active' }
        : { status: 'active', gymId },
    });

    // ── 3) Toplam gelir (sum) ──
    const revenueQuery = this.enrollRepo
      .createQueryBuilder('e')
      .select('SUM(e.amountPaid)', 'total');
    if (!isSuper) revenueQuery.where('e.gymId = :gymId', { gymId });
    const revenueResult = await revenueQuery.getRawOne();
    const totalRevenue = parseFloat(revenueResult.total) || 0;

    // ── 4) Bugünkü girişler (count) ──
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayCheckIns = await this.checkInRepo.count({
      where: isSuper
        ? { checkInTime: MoreThanOrEqual(startOfToday) }
        : { checkInTime: MoreThanOrEqual(startOfToday), gymId },
    });

    // ── 5) En popüler paketler (group by) ──
    const popularQuery = this.enrollRepo
      .createQueryBuilder('e')
      .leftJoin('e.plan', 'plan')
      .select('plan.name', 'planName')
      .addSelect('COUNT(e.id)', 'count');
    if (!isSuper) popularQuery.where('e.gymId = :gymId', { gymId });
    const popularPlans = await popularQuery
      .groupBy('plan.name')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    // ── 6) Rol dağılımı (group by) ──
    const roleQuery = this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(u.id)', 'count');
    if (!isSuper) roleQuery.where('u.gymId = :gymId', { gymId });
    const roleDistribution = await roleQuery.groupBy('u.role').getRawMany();

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