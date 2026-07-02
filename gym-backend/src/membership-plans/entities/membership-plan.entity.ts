import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

@Entity('membership_plans')
export class MembershipPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  durationMonths: number;

  @Column('decimal', { precision: 10, scale: 2, transformer: {
  to: (v) => v,
  from: (v) => parseFloat(v),
}})
price: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  includesPersonalTraining: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Enrollment, (e) => e.plan)
  enrollments: Enrollment[];
}