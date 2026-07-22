import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthProfile } from './entities/health-profile.entity';
import { User } from '../users/entities/user.entity';
import { UpsertHealthProfileDto } from './dto/upsert-health-profile.dto';

@Injectable()
export class HealthProfilesService {
  constructor(
    @InjectRepository(HealthProfile) private repo: Repository<HealthProfile>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // Kullanıcının profilini getir (yoksa NotFoundException)
  async findByUser(userId: number) {
    const profile = await this.repo.findOne({ where: { user: { id: userId } } });
    if (!profile) {
      throw new NotFoundException('Lütfen profil bilgilerinizi giriniz');
    }
    return profile;
  }

  // Profili oluştur ya da güncelle (upsert)
  async upsert(userId: number, dto: UpsertHealthProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    let profile = await this.repo.findOne({ where: { user: { id: userId } } });

    if (profile) {
      // Güncelle
      Object.assign(profile, dto);
    } else {
      // Yeni oluştur
      profile = this.repo.create({ ...dto, user });
    }
    return this.repo.save(profile);
  }
}