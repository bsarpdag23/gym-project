import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { WorkoutProgram } from '../../workout-programs/entities/workout-program.entity';
import { randomBytes } from 'crypto';

export enum UserRole {
  ADMIN   = 'admin',
  TRAINER = 'trainer',
  MEMBER  = 'member',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @Column({ type: 'text', default: UserRole.MEMBER })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Enrollment, (e) => e.member)
  enrollments: Enrollment[];

  @OneToMany(() => WorkoutProgram, (p) => p.trainer)
  workoutPrograms: WorkoutProgram[];

  // Bu üyeye atanmış PT trainer'ı (kendisi de bir User, rolü 'trainer')
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTrainerId' })
  assignedTrainer: User;

  @Column({ nullable: true })
  assignedTrainerId: number | null;

  @Column({ nullable: true, unique: true })
  qrToken: string;

  @BeforeInsert()
  generateQrToken() {
    // 32 karakterlik rastgele, tahmin edilemez token
    this.qrToken = randomBytes(16).toString('hex');
  }
}