import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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
  @UseGuards(RolesGuard) @Roles('admin', 'trainer')
  create(@Body() dto: CreateExerciseDto) { return this.service.create(dto); }

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Patch(':id')
  @UseGuards(RolesGuard) @Roles('admin', 'trainer')
  update(@Param('id') id: string, @Body() dto: UpdateExerciseDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('admin', 'trainer')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}