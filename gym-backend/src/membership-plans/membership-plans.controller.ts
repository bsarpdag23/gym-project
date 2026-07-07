import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MembershipPlansService } from './membership-plans.service';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';

@Controller('membership-plans')
@UseGuards(JwtAuthGuard)
export class MembershipPlansController {
  constructor(private readonly service: MembershipPlansService) {}

  @Post()
  @UseGuards(RolesGuard) @Roles('admin')
  create(@Body() dto: CreateMembershipPlanDto, @Request() req) {
    return this.service.create(dto, req.user);
  }

  @Get()
findAll(@Request() req) {
  return this.service.findAll(req.user);
}

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Patch(':id')
  @UseGuards(RolesGuard) @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateMembershipPlanDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard) @Roles('admin')
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}