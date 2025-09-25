import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateTicketCommentDto } from '../dto/create-ticket-comment.dto';
import { TicketComment } from '../ticket-comment.model';

@Injectable()
export class TicketCommentsService {
  constructor(
    @InjectModel(TicketComment) private readonly model: typeof TicketComment,
  ) {}

  create(ticketId: string, dto: CreateTicketCommentDto) {
    return this.model.create({ ...(dto as any), ticketId });
  }

  findAll(ticketId: string) {
    return this.model.findAll({
      where: { ticketId },
      order: [['created_at', 'ASC']],
    });
  }

  async remove(id: string) {
    const c = await this.model.findByPk(id);
    if (!c) throw new NotFoundException('Ticket comment not found');
    await c.destroy();
    return { deleted: true };
  }
}
