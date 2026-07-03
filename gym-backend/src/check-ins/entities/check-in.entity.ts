import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('check_ins')
export class CheckIn {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  member: User;

  @CreateDateColumn()
  checkInTime: Date;
}