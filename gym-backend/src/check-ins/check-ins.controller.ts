import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CheckInsService } from './check-ins.service';

@Controller('check-ins')
export class CheckInsController {
  constructor(private readonly service: CheckInsService) {}

  @Post('scan')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('super_admin', 'admin', 'trainer')
  scan(@Body() body: { qrToken: string }, @Request() req) {
    return this.service.checkIn(body.qrToken, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('super_admin', 'admin', 'trainer')
  findAll(@Request() req) { return this.service.findAll(req.user); }

  @Post('backfill-tokens')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('super_admin', 'admin')
  backfill() { return this.service.backfillTokens(); }
}