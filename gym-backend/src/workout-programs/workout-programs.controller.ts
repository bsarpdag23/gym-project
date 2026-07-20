import {
  Body, Controller, Delete, Get,
  Param, Patch, Post, Request, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard }   from '../auth/guards/roles.guard';
import { Roles }        from '../auth/decorators/roles.decorator';
import { WorkoutProgramsService }    from './workout-programs.service';
import { CreateWorkoutProgramDto }   from './dto/create-workout-program.dto';
import { UpdateWorkoutProgramDto }   from './dto/update-workout-program.dto';
import { RateProgramDto }            from './dto/rate-program.dto';

@Controller('workout-programs')
@UseGuards(JwtAuthGuard)
export class WorkoutProgramsController {
  constructor(private readonly service: WorkoutProgramsService) {}

  @Post()
  @UseGuards(RolesGuard) @Roles('admin', 'trainer')
  create(@Body() dto: CreateWorkoutProgramDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Patch(':id')
  @UseGuards(RolesGuard) @Roles('admin', 'trainer')
  update(@Param('id') id: string, @Body() dto: UpdateWorkoutProgramDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('admin', 'trainer')
  remove(@Param('id') id: string) { return this.service.remove(+id); }

  @Post(':programId/exercises/:exerciseId')
  @UseGuards(RolesGuard) @Roles('admin', 'trainer')
  addExercise(@Param('programId') pId: string, @Param('exerciseId') eId: string) {
    return this.service.addExercise(+pId, +eId);
  }

  @Delete(':programId/exercises/:exerciseId')
  @UseGuards(RolesGuard) @Roles('admin', 'trainer')
  removeExercise(@Param('programId') pId: string, @Param('exerciseId') eId: string) {
    return this.service.removeExercise(+pId, +eId);
  }

  @Post(':id/ratings')
  rate(@Param('id') id: string, @Body() dto: RateProgramDto, @Request() req) {
    return this.service.rate(+id, req.user.userId, dto);
  }
}