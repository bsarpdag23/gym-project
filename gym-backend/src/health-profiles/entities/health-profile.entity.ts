import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('health_profiles')
export class HealthProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('decimal', { precision: 5, scale: 2, transformer: {
    to: (v) => v,
    from: (v) => parseFloat(v),
  }})
  heightCm: number;        // boy (cm)

  @Column('decimal', { precision: 5, scale: 2, transformer: {
    to: (v) => v,
    from: (v) => parseFloat(v),
  }})
  weightKg: number;        // mevcut kilo

  @Column()
  age: number;

  @Column()
  gender: string;          // 'male' | 'female'

  @Column('decimal', { precision: 5, scale: 2, transformer: {
    to: (v) => v,
    from: (v) => parseFloat(v),
  }})
  targetWeightKg: number;  // hedef kilo

  @Column()
  weeklyWorkoutDays: number;  // haftada kaç gün antrenman

  @Column({ default: 'moderate' })
  activityLevel: string;   // 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

  @Column('decimal', { precision: 5, scale: 2, nullable: true, transformer: {
    to: (v) => v,
    from: (v) => parseFloat(v),
  }})
  bodyFatPercentage: number;  // opsiyonel

  @Column({ nullable: true, type: 'int' })
  gymId: number | null;
}