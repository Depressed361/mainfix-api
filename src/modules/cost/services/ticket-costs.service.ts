import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateTicketCostDto } from '../dto/create-ticket-cost.dto';
import { TicketCost } from '../models/ticket-cost.model';

@Injectable()
export class TicketCostsService {
  constructor(@InjectModel(TicketCost) private readonly model: typeof TicketCost) {}

  create(ticketId: string, dto: CreateTicketCostDto) {
    return this.model.create({ ...(dto as any), ticketId } as any);
  }

  findAll(ticketId: string) {
    return this.model.findAll({
      where: { ticketId } as any,
      order: [['created_at', 'ASC']],
    });
  }

  async remove(id: string) {
    const c = await this.model.findByPk(id);
    if (!c) throw new NotFoundException('Ticket cost not found');
    await c.destroy();
    return { deleted: true };
  }
}
