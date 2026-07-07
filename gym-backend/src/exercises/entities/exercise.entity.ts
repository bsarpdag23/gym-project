import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { WorkoutProgram } from '../../workout-programs/entities/workout-program.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  muscleGroup: string;   // göğüs, sırt, bacak, omuz, kol, karın, tüm vücut

  @Column({ default: 'both' })
  goalType: string;      // 'gain' (kilo alma), 'lose' (kilo verme), 'both'

  @Column({ nullable: true })
  equipment: string;

  @Column({ default: 3 })
  sets: number;

  @Column({ default: 12 })
  reps: number;

  @Column({ nullable: true })
  videoUrl: string;

  @ManyToMany(() => WorkoutProgram, (p) => p.exercises)
  workoutPrograms: WorkoutProgram[];

  @Column({ nullable: true, type: 'int' })
  gymId: number | null;
}