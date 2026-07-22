import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
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

  private getDayName(date: Date) {
    const names = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    return names[date.getDay() === 0 ? 6 : date.getDay() - 1];
  }

  private getHourBuckets(checkIns: CheckIn[]) {
    const buckets = new Map<string, number>();
    for (const item of checkIns) {
      const date = new Date(item.checkInTime);
      const key = `${this.getDayName(date)}|${date.getHours()}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return Array.from(buckets.entries())
      .map(([key, count]) => {
        const [day, hour] = key.split('|');
        return { day, hour: Number(hour), count };
      })
      .sort((a, b) => b.count - a.count);
  }

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
    const occupancyWhere = isSuper ? {} : { gymId };
    const occupancyBuckets = this.getHourBuckets(await this.checkInRepo.find({ where: occupancyWhere, order: { checkInTime: 'ASC' }, take: 500 }));
    const peakHours = occupancyBuckets.slice(0, 3);
    const quietHours = [...occupancyBuckets].sort((a, b) => a.count - b.count).slice(0, 3);

    // ── 7) Üyeliği yakında bitecek üyeler (son 7 gün içinde) ──
    const startOfTodayForExp = new Date();
    startOfTodayForExp.setHours(0, 0, 0, 0);

    const endOf7Days = new Date();
    endOf7Days.setDate(endOf7Days.getDate() + 7);
    endOf7Days.setHours(23, 59, 59, 999);

    const expiringWhere: any = {
      status: 'active',
      endDate: Between(startOfTodayForExp, endOf7Days),
    };
    if (!isSuper) {
      expiringWhere.gymId = gymId;
    }

    const expiringEnrollments = await this.enrollRepo.find({
      where: expiringWhere,
      relations: { member: true, plan: true },
      order: { endDate: 'ASC' },
      take: 10,
    });

    return {
      totalMembers,
      activeEnrollments,
      totalRevenue,
      todayCheckIns,
      popularPlans: popularPlans.map(p => ({ name: p.planName, count: parseInt(p.count) })),
      roleDistribution: roleDistribution.map(r => ({ role: r.role, count: parseInt(r.count) })),
      occupancySummary: {
        peakHours: peakHours.map((slot) => ({ day: slot.day, hour: slot.hour, checkIns: slot.count })),
        quietHours: quietHours.map((slot) => ({ day: slot.day, hour: slot.hour, checkIns: slot.count })),
      },
      expiringMembers: expiringEnrollments.map(e => ({
        id: e.id,
        memberId: e.member?.id,
        memberName: e.member?.fullName,
        memberEmail: e.member?.email,
        memberPhone: e.member?.phone,
        planName: e.plan?.name,
        endDate: e.endDate,
        daysRemaining: Math.max(0, Math.ceil((new Date(e.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
      })),
    };
  }

  async getOccupancyPrediction(currentUser: any) {
    const isSuper = currentUser.role === 'super_admin';
    const gymId = currentUser.gymId;

    const where = isSuper ? {} : { gymId };
    const checkIns = await this.checkInRepo.find({
      where,
      order: { checkInTime: 'ASC' },
      take: 500,
    });

    if (!checkIns.length) {
      return {
        message: 'Henüz yeterli check-in verisi yok, bu yüzden tahmin oluşturulamadı.',
        busySlots: [],
        quietSlots: [],
        recommendation: 'Önce birkaç check-in kaydı oluşturun.',
      };
    }

    const buckets = this.getHourBuckets(checkIns);
    const topBusy = buckets.slice(0, 3);
    const quietSlots = [...buckets].sort((a, b) => a.count - b.count).slice(0, 3);

    const now = new Date();
    const dayName = this.getDayName(now);
    const currentHour = now.getHours();
    const currentBucket = buckets.find((slot) => slot.day === dayName && slot.hour === currentHour);
    const occupancyPercent = currentBucket ? Math.min(100, Math.round((currentBucket.count / Math.max(...buckets.map((slot) => slot.count), 1)) * 100)) : 0;

    let intensity = 'düşük';
    let recommendation = 'Bu saat salon nispeten sakin; rahat bir antrenman için uygun.';

    if (occupancyPercent >= 80) {
      intensity = 'yüksek';
      recommendation = 'Bu saat salon oldukça yoğun; erken gelmek iyi bir seçenek olabilir.';
    } else if (occupancyPercent >= 50) {
      intensity = 'orta';
      recommendation = 'Bu saat salon orta dolu; birkaç dakika erken gelmek iyi olabilir.';
    }

    return {
      day: dayName,
      hour: currentHour,
      occupancyPercent,
      intensity,
      recommendation,
      busySlots: topBusy.map((slot) => ({ day: slot.day, hour: slot.hour, checkIns: slot.count })),
      quietSlots: quietSlots.map((slot) => ({ day: slot.day, hour: slot.hour, checkIns: slot.count })),
    };
  }
}