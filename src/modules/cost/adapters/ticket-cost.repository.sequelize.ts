import { InjectModel } from '@nestjs/sequelize';
import type { TicketCostRepository, TicketCostEntity } from '../domain/ports';
import { TicketCost } from '../models/ticket-cost.model';
import { toDomainCost } from './mappers';

export class SequelizeTicketCostRepository implements TicketCostRepository {
  constructor(@InjectModel(TicketCost) private readonly model: typeof TicketCost) {}

  async upsertByTicket(p: { ticketId: string; laborHours?: string; laborRate?: string; currency?: string; }): Promise<TicketCostEntity> {
    let row = await this.model.findOne({ where: { ticketId: p.ticketId } as any });
    if (!row) {
      row = await this.model.create({ ticketId: p.ticketId, laborHours: p.laborHours ?? null, laborRate: p.laborRate ?? null, currency: p.currency ?? 'EUR' } as any);
      return toDomainCost(row);
    }
    if (p.laborHours !== undefined) (row as any).laborHours = p.laborHours;
    if (p.laborRate !== undefined) (row as any).laborRate = p.laborRate;
    if (p.currency !== undefined) row.currency = p.currency;
    await row.save();
    return toDomainCost(row);
  }

  async setPartsCost(ticketId: string, partsCost: string): Promise<void> {
    const row = await this.model.findOne({ where: { ticketId } as any });
    if (!row) {
      await this.model.create({ ticketId, partsCost, currency: 'EUR' } as any);
      return;
    }
    (row as any).partsCost = partsCost;
    await row.save();
  }

  async getByTicket(ticketId: string): Promise<TicketCostEntity | null> {
    const row = await this.model.findOne({ where: { ticketId } as any });
    return row ? toDomainCost(row) : null;
  }
}

