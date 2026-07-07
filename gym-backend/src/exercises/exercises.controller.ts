import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard }   from '../auth/guards/roles.guard';
import { Roles }        from '../auth/decorators/roles.decorator';
import { ExercisesService }    from './exercises.service';
import { CreateExerciseDto }   from './dto/create-exercise.dto';
import { UpdateExerciseDto }   from './dto/update-exercise.dto';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private readonly service: ExercisesService) {}

  @Post()
  @UseGuards(RolesGuard) @Roles('super_admin', 'admin', 'trainer')
  create(@Body() dto: CreateExerciseDto, @Request() req) {
    return this.service.create(dto, req.user);
  }

  @Get()
  findAll(@Request() req) { return this.service.findAll(req.user); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Patch(':id')
  @UseGuards(RolesGuard) @Roles('super_admin', 'admin', 'trainer')
  update(@Param('id') id: string, @Body() dto: UpdateExerciseDto, @Request() req) {
    return this.service.update(+id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('super_admin', 'admin', 'trainer')
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(+id, req.user);
  }
}