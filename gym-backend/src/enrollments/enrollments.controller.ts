import {
  Body, Controller, Delete, Get,
  Param, Patch, Post, Request, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard }   from '../auth/guards/roles.guard';
import { Roles }        from '../auth/decorators/roles.decorator';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Post()
  create(@Body() dto: CreateEnrollmentDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  @UseGuards(RolesGuard) @Roles('admin', 'trainer')   // ← trainer da görebilir artık
  findAll() { return this.service.findAll(); }

  @Get('my-enrollments')
  findMine(@Request() req) { return this.service.findByUser(req.user.userId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Patch(':id')
  @UseGuards(RolesGuard) @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateEnrollmentDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('admin')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}