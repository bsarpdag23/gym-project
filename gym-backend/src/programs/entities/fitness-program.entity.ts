import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('fitness_programs')
export class FitnessProgram {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  goal: string;              // 'gain' | 'lose' | 'maintain'

  @Column()
  startWeightKg: number;

  @Column()
  targetWeightKg: number;

  @Column()
  durationWeeks: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  // ── Diyet hedefleri ──
  @Column()
  dailyCalories: number;

  @Column()
  proteinG: number;

  @Column()
  fatG: number;

  @Column()
  carbsG: number;

  // ── Antrenman planı (esnek yapı, jsonb) ──
  // Örn: [{ day: 1, focus: 'Göğüs & Kol', exercises: [{id,name,sets,reps,...}] }, ...]
  @Column({ type: 'jsonb' })
  workoutPlan: any;

  @Column({ type: 'jsonb', default: [] })
  warnings: any;

  @Column({ default: true })
  isActive: boolean;         // yeni üretilince eskiler false olur

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'int' })
  gymId: number | null;
}