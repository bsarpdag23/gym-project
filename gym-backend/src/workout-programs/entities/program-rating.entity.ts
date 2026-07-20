import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WorkoutProgram } from './workout-program.entity';

@Entity('program_ratings')
@Unique(['program', 'user'])
export class ProgramRating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkoutProgram, (p) => p.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'programId' })
  program: WorkoutProgram;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ nullable: true, type: 'text' })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
