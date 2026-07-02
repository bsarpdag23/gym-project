import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HealthProfilesService } from './health-profiles.service';
import { UpsertHealthProfileDto } from './dto/upsert-health-profile.dto';

@Controller('health-profile')
@UseGuards(JwtAuthGuard)
export class HealthProfilesController {
  constructor(private readonly service: HealthProfilesService) {}

  // Kendi profilimi getir
  @Get('me')
  getMine(@Request() req) {
    return this.service.findByUser(req.user.userId);
  }

  // Kendi profilimi oluştur/güncelle
  @Put('me')
  upsertMine(@Request() req, @Body() dto: UpsertHealthProfileDto) {
    return this.service.upsert(req.user.userId, dto);
  }
}