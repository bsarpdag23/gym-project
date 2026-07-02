import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, ManyToMany, JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity('workout_programs')
export class WorkoutProgram {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  difficulty: string;

  @Column({ default: 4 })
  weeksCount: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (u) => u.workoutPrograms)
  trainer: User;

  @ManyToMany(() => Exercise, (e) => e.workoutPrograms)
  @JoinTable({
    name: 'program_exercises',
    joinColumn:        { name: 'programId',  referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'exerciseId', referencedColumnName: 'id' },
  })
  exercises: Exercise[];
}