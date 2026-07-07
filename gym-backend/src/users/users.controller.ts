import { Body, Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignTrainerDto } from './dto/assign-trainer.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @UseGuards(RolesGuard) @Roles('super_admin', 'admin', 'trainer')
  findAll(@Request() req) {
    return this.service.findAll(req.user);
  }

  @Get('trainers')
  @UseGuards(RolesGuard) @Roles('super_admin', 'admin')
  findTrainers(@Request() req) {
    return this.service.findTrainers(req.user);
  }

  @Get('my-members')
  @UseGuards(RolesGuard) @Roles('trainer')
  findMyMembers(@Request() req) {
    return this.service.findMyMembers(req.user.userId);
  }

  @Get('me')
  findMe(@Request() req) {
    return this.service.findMe(req.user.userId);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard) @Roles('super_admin', 'admin')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto, @Request() req) {
    return this.service.updateRole(+id, dto.role, req.user);
  }

  @Patch(':id/trainer')
  @UseGuards(RolesGuard) @Roles('super_admin', 'admin')
  assignTrainer(@Param('id') id: string, @Body() dto: AssignTrainerDto, @Request() req) {
    return this.service.assignTrainer(+id, dto.trainerId ?? null, req.user);
  }
}