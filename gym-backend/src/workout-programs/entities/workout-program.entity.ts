import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, ManyToMany, OneToMany, JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { ProgramRating } from './program-rating.entity';

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

  // bkz. PROGRAM_CATEGORIES (program-category.util.ts)
  @Column({ default: 'full_body' })
  category: string;

  // 'trainer' (antrenör/admin elle oluşturdu) | 'ai' (üye program üretirken otomatik eklendi)
  @Column({ default: 'trainer' })
  source: string;

  // AI kaynaklı programlarda oluşturan bir antrenör olmayabilir (üye kendi programını üretmiştir)
  @ManyToOne(() => User, (u) => u.workoutPrograms, { nullable: true })
  author: User | null;

  @ManyToMany(() => Exercise, (e) => e.workoutPrograms)
  @JoinTable({
    name: 'program_exercises',
    joinColumn:        { name: 'programId',  referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'exerciseId', referencedColumnName: 'id' },
  })
  exercises: Exercise[];

  @OneToMany(() => ProgramRating, (r) => r.program)
  ratings: ProgramRating[];
}