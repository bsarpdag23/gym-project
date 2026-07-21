import { Body, Controller, Get, Param, Post, Patch, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';

@Controller('gyms')
export class GymsController {
  constructor(private readonly service: GymsService) {}

  // Herkesin erişebileceği halka açık aktif salon listesi (Kayıt ekranı için)
  @Get('public')
  findPublic() {
    return this.service.findPublicList();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  findAll() { return this.service.findAll(); }

  @Get('global-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  getGlobalStats() {
    return this.service.getGlobalStats();
  }

  @Get(':id/detail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  getGymDetail(@Param('id') id: string) {
    return this.service.getGymDetail(+id);
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  getGymUsers(@Param('id') id: string) {
    return this.service.getGymUsers(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  create(@Body() dto: CreateGymDto) { return this.service.create(dto); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  update(@Param('id') id: string, @Body() dto: { name?: string; address?: string; phone?: string; isActive?: boolean }) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}