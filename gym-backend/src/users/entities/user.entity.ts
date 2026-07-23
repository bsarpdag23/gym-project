import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { WorkoutProgram } from '../../workout-programs/entities/workout-program.entity';
import { randomBytes } from 'crypto';
import { Gym } from '../../gyms/entities/gym.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',   // ← platform sahibi (sen)
  ADMIN = 'admin',                // salon sahibi
  TRAINER = 'trainer',
  MEMBER = 'member',
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

  @OneToMany(() => WorkoutProgram, (p) => p.author)
  workoutPrograms: WorkoutProgram[];

  // Bu üyeye atanmış PT trainer'ı (kendisi de bir User, rolü 'trainer')
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTrainerId' })
  assignedTrainer: User;

  @Column({ nullable: true })
  assignedTrainerId: number | null;

  @Column({ nullable: true, unique: true })
  qrToken: string;

  @ManyToOne(() => Gym, { nullable: true })
  @JoinColumn({ name: 'gymId' })
  gym: Gym;

  @Column({ nullable: true, type: 'int' })
  gymId: number | null;   // süper admin için null olabilir

  @Column({ default: 0, type: 'int' })
  points: number;

  @Column({ type: 'simple-array', default: '' })
  badges: string[];

  // true ise diğer üyelerin sohbet/üye listesinde görünmez, yeni sohbet başlatılamaz
  @Column({ default: false })
  hideProfile: boolean;

  // /uploads/avatars/xxx.webp gibi statik olarak servis edilen göreli yol
  @Column({ nullable: true, type: 'varchar' })
  avatarUrl: string | null;

  @Column({ nullable: true })
  resetPasswordToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordExpires: Date | null;

  @BeforeInsert()
  generateQrToken() {
    // 32 karakterlik rastgele, tahmin edilemez token
    this.qrToken = randomBytes(16).toString('hex');
  }
}