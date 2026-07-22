import {
  Body, Controller, Get, Param, Patch, Post, Delete, Request, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Delete('me')
  deleteMine(@Request() req) {
    return this.service.deleteMyAccount(req.user.userId);
  }

  @Get('me/gamification')
  getGamification(@Request() req) {
    return this.service.getGamification(req.user.userId);
  }

  @Patch('me/privacy')
  updatePrivacy(@Body() dto: { hideProfile: boolean }, @Request() req) {
    return this.service.updatePrivacy(req.user.userId, !!dto.hideProfile);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadAvatar(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.service.uploadAvatar(req.user.userId, file);
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

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('super_admin', 'admin')
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(+id, req.user);
  }
}