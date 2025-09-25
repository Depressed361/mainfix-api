import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateTicketAttachmentDto } from '../dto/create-ticket-attachment.dto';
import { TicketAttachment } from '../ticket-attachment.model';

@Injectable()
export class TicketAttachmentsService {
  constructor(
    @InjectModel(TicketAttachment)
    private readonly model: typeof TicketAttachment,
  ) {}

  create(ticketId: string, dto: CreateTicketAttachmentDto) {
    return this.model.create({ ...(dto as any), ticketId } as any);
  }

  findAll(ticketId: string) {
    return this.model.findAll({
      where: { ticketId } as any,
      order: [['created_at', 'ASC']],
    });
  }

  async remove(id: string) {
    const a = await this.model.findByPk(id);
    if (!a) throw new NotFoundException('Ticket attachment not found');
    await a.destroy();
    return { deleted: true };
  }
}
