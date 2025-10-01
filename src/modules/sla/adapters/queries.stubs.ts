import { InjectModel } from '@nestjs/sequelize';
import type { ContractsQuery, TicketsQuery, TicketPriority, TicketStatus } from '../domain/ports';
import { Ticket } from '../../tickets/models/ticket.model';

export class StubContractsQuery implements ContractsQuery {
  async getCategorySla(_contractVersionId: string, _categoryId: string) {
    return {
      P1: { ackMinutes: 30, resolveHours: 4 },
      P2: { ackMinutes: 120, resolveHours: 24 },
      P3: { ackMinutes: 240, resolveHours: 72 },
    };
  }
}

export class SequelizeTicketsQuery implements TicketsQuery {
  constructor(@InjectModel(Ticket) private readonly tickets: typeof Ticket) {}
  async getTicketMeta(ticketId: string) {
    const t = await this.tickets.findByPk(ticketId);
    if (!t) throw new Error('sla.ticket_not_found');
    return {
      companyId: t.companyId,
      siteId: t.siteId,
      buildingId: (t as any).buildingId ?? null,
      categoryId: t.categoryId,
      priority: t.priority as TicketPriority,
      status: t.status as TicketStatus,
      createdAt: t.createdAt,
      ackAt: (t as any).ackAt ?? null,
      resolvedAt: (t as any).resolvedAt ?? null,
      contractVersionId: (t as any).contractId ?? '',
    };
  }
  async listEvents(_ticketId: string) { return [] }
}
