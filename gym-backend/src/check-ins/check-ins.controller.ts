import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CheckInsService } from './check-ins.service';

@Controller('check-ins')
export class CheckInsController {
  constructor(private readonly service: CheckInsService) {}

  // QR okutma — girişte turnike/görevli tarafından kullanılır
  @Post('scan')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin', 'trainer')
  scan(@Body() body: { qrToken: string }) {
    return this.service.checkIn(body.qrToken);
  }

  // Giriş kayıtları — admin görür
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')
  findAll() { return this.service.findAll(); }

  // Bir kerelik: eski kullanıcılara token üret
  @Post('backfill-tokens')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')
  backfill() { return this.service.backfillTokens(); }
}