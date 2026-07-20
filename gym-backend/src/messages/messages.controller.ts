import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get('directory')
  getDirectory(@Request() req) {
    return this.service.getDirectory(req.user);
  }

  @Get('conversations')
  getConversations(@Request() req) {
    return this.service.getConversations(req.user.userId);
  }

  @Get(':userId')
  getThread(@Param('userId') userId: string, @Request() req) {
    return this.service.getThread(req.user.userId, +userId);
  }

  @Post(':userId')
  send(@Param('userId') userId: string, @Body() dto: SendMessageDto, @Request() req) {
    return this.service.sendMessage(req.user, +userId, dto.content);
  }
}
