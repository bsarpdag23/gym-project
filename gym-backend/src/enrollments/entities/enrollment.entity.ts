import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MembershipPlan } from '../../membership-plans/entities/membership-plan.entity';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.enrollments)
  member: User;

  @ManyToOne(() => MembershipPlan, (p) => p.enrollments)
  plan: MembershipPlan;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: 'active' })
  status: string;

  @Column('decimal', { precision: 10, scale: 2, transformer: {
  to: (v) => v,
  from: (v) => parseFloat(v),
}})
amountPaid: number;
}