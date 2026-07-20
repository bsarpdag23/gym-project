import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  getStats(@Request() req) { return this.service.getStats(req.user); }

  @Get('occupancy-prediction')
  getOccupancyPrediction(@Request() req) { return this.service.getOccupancyPrediction(req.user); }
}