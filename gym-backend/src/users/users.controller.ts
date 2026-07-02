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
  @UseGuards(RolesGuard) @Roles('admin', 'trainer')
  findAll() { return this.service.findAll(); }

  @Get('trainers')
  @UseGuards(RolesGuard) @Roles('admin')
  findTrainers() { return this.service.findTrainers();
   }

   @Get('my-members')
  @UseGuards(RolesGuard) @Roles('trainer')
  findMyMembers(@Request() req) {
    return this.service.findMyMembers(req.user.userId);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard) @Roles('admin')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.updateRole(+id, dto.role);
  }

  @Patch(':id/trainer')
  @UseGuards(RolesGuard) @Roles('admin')
  assignTrainer(@Param('id') id: string, @Body() dto: AssignTrainerDto) {
    return this.service.assignTrainer(+id, dto.trainerId ?? null);
  }
}