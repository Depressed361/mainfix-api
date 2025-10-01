import { InjectModel } from '@nestjs/sequelize';
import type { TicketLinkRepository } from '../domain/ports';
import { TicketLink } from '../models/ticket-link.model';
import { toDomainLink } from './mappers';

export class SequelizeTicketLinkRepository implements TicketLinkRepository {
  constructor(@InjectModel(TicketLink) private readonly model: typeof TicketLink) {}
  async create(l: { sourceTicketId: string; targetTicketId: string; type: any }) {
    const relation = l.type === 'parent' || l.type === 'child' ? 'parent-child' : l.type;
    const row = await this.model.create({ parentTicketId: l.sourceTicketId, childTicketId: l.targetTicketId, relation } as any);
    return toDomainLink(row);
  }
  async delete(id: string) {
    const [src, dst] = id.split('->');
    await this.model.destroy({ where: { parentTicketId: src, childTicketId: dst } as any });
  }
  async list(ticketId: string) { const rows = await this.model.findAll({ where: { parentTicketId: ticketId } as any }); return rows.map(toDomainLink) }
}

