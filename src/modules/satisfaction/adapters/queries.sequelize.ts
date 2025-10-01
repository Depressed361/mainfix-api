import { InjectModel } from '@nestjs/sequelize';
import type { TicketsQuery, DirectoryQuery } from '../domain/ports';
import { Ticket } from '../../tickets/models/ticket.model';
import { User } from '../../directory/models/user.model';

export class SequelizeTicketsQuery implements TicketsQuery {
  constructor(@InjectModel(Ticket) private readonly tickets: typeof Ticket) {}
  async getTicketMeta(ticketId: string) {
    const t = await this.tickets.findByPk(ticketId);
    if (!t) throw new Error('satisfaction.ticket_not_found');
    return { companyId: t.companyId, siteId: t.siteId, reporterId: (t as any).reporterId ?? '', status: t.status };
  }
}

export class SequelizeDirectoryQuery implements DirectoryQuery {
  constructor(@InjectModel(User) private readonly users: typeof User) {}
  async getUserMeta(userId: string) {
    const u = await this.users.findByPk(userId); if (!u) throw new Error('satisfaction.user_not_found');
    return { companyId: u.companyId, role: u.role as any, active: u.active };
  }
}

