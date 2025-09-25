import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateTicketAttachmentDto } from '../dto/create-ticket-attachment.dto';
import { TicketAttachmentsService } from '../services/ticket-attachments.service';

@Controller('tickets/:id/attachments')
export class TicketAttachmentsController {
  constructor(private readonly attachments: TicketAttachmentsService) {}

  @Post()
  create(
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketAttachmentDto,
  ) {
    console.log('POST /tickets - body:', dto);
    return this.attachments.create(ticketId, dto);
  }

  @Get()
  list(@Param('id') ticketId: string) {
    return this.attachments.findAll(ticketId);
  }
}

@Controller('ticket_attachments')
export class TicketAttachmentsAdminController {
  constructor(private readonly attachments: TicketAttachmentsService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attachments.remove(id);
  }
}
