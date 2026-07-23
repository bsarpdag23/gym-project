import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('gyms')
export class Gym {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;              // salon adı

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;         // salon aktif mi (süper admin askıya alabilir)

  @Column({ default: 50 })
  capacity: number;          // Salon kapasitesi

  @CreateDateColumn()
  createdAt: Date;
}