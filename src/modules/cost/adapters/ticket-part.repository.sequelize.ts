import { InjectModel } from '@nestjs/sequelize';
import { Sequelize, QueryTypes } from 'sequelize';
import type { TicketPartRepository, TicketPartEntity } from '../domain/ports';
import { TicketPart } from '../models/ticket-part.model';
import { toDomainPart } from './mappers';

export class SequelizeTicketPartRepository implements TicketPartRepository {
  constructor(@InjectModel(TicketPart) private readonly model: typeof TicketPart) {}

  async addOrUpdate(p: { id?: string | undefined; ticketId: string; sku?: string | undefined; label?: string | undefined; qty?: string | undefined; unitCost?: string | undefined; }): Promise<TicketPartEntity> {
    if (p.id) {
      const row = await this.model.findOne({ where: { id: p.id, ticketId: p.ticketId } as any });
      if (!row) throw new Error('cost.part.not_found');
      if (p.sku !== undefined) row.sku = p.sku ?? null as any;
      if (p.label !== undefined) row.label = p.label ?? null as any;
      if (p.qty !== undefined) (row as any).qty = p.qty;
      if (p.unitCost !== undefined) (row as any).unitCost = p.unitCost;
      await row.save();
      return toDomainPart(row);
    }
    const row = await this.model.create({ ticketId: p.ticketId, sku: p.sku ?? null, label: p.label ?? null, qty: p.qty ?? null, unitCost: p.unitCost ?? null } as any);
    return toDomainPart(row);
  }

  async remove(p: { id: string; ticketId: string; }): Promise<void> {
    await this.model.destroy({ where: { id: p.id, ticketId: p.ticketId } as any });
  }

  async listByTicket(ticketId: string): Promise<TicketPartEntity[]> {
    const rows = await this.model.findAll({ where: { ticketId } as any, order: [['label', 'ASC']] });
    return rows.map(toDomainPart);
  }

  async sumPartsCost(ticketId: string): Promise<string> {
    const sequelize: Sequelize | undefined = (this.model as any).sequelize;
    if (!sequelize) return '0.00';
    const [row] = await sequelize.query<{ parts_cost: string }>(
      'SELECT COALESCE(SUM(COALESCE(qty,0) * COALESCE(unit_cost,0)), 0)::text as parts_cost FROM ticket_parts WHERE ticket_id = :ticketId',
      { replacements: { ticketId }, type: QueryTypes.SELECT }
    );
    return row?.parts_cost ?? '0.00';
  }
}

