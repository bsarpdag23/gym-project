import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgramsService } from './programs.service';

@Controller('programs')
@UseGuards(JwtAuthGuard)
export class ProgramsController {
  constructor(private readonly service: ProgramsService) {}

  @Get('preview')
  preview(@Request() req) { return this.service.preview(req.user.userId); }

  @Post('generate')
  generate(@Request() req) { return this.service.generate(req.user.userId); }

@Post('generate-ai')
  generateAI(@Request() req) { return this.service.generateWithAI(req.user.userId); }

  @Get('active')
  active(@Request() req) { return this.service.findActive(req.user.userId); }

  @Get('history')
  history(@Request() req) { return this.service.findAll(req.user.userId); }
}