import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateTicketCommentDto } from '../dto/create-ticket-comment.dto';
import { TicketCommentsService } from '../services/ticket-comments.service';

@Controller('tickets/:id/comments')
export class TicketCommentsController {
  constructor(private readonly comments: TicketCommentsService) {}

  @Post()
  create(@Param('id') ticketId: string, @Body() dto: CreateTicketCommentDto) {
    return this.comments.create(ticketId, dto);
  }

  @Get()
  list(@Param('id') ticketId: string) {
    return this.comments.findAll(ticketId);
  }
}

@Controller('ticket_comments')
export class TicketCommentsAdminController {
  constructor(private readonly comments: TicketCommentsService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comments.remove(id);
  }
}
