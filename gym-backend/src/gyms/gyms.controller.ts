import { Body, Controller, Get, Param, Post, Patch, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';

@Controller('gyms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')   // ← sadece süper admin
export class GymsController {
  constructor(private readonly service: GymsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('global-stats')
  getGlobalStats() {
    return this.service.getGlobalStats();
  }

  @Get(':id/detail')
  getGymDetail(@Param('id') id: string) {
    return this.service.getGymDetail(+id);
  }

  @Get(':id/users')
  getGymUsers(@Param('id') id: string) {
    return this.service.getGymUsers(+id);
  }

  @Post()
  create(@Body() dto: CreateGymDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: { name?: string; address?: string; phone?: string; isActive?: boolean }) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}