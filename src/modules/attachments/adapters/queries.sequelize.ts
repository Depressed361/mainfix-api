import { InjectModel } from '@nestjs/sequelize';
import type { TicketQuery, DirectoryQuery, TicketEventCommand } from '../domain/ports';
import { Ticket } from '../../tickets/models/ticket.model';
import { User } from '../../directory/models/user.model';
import { TeamMember } from '../../directory/models/team-member.model';
import { TicketEvent } from '../../tickets/models/ticket-event.model';

export class SequelizeTicketQuery implements TicketQuery {
  constructor(@InjectModel(Ticket) private readonly tickets: typeof Ticket) {}
  async getTicketMeta(ticketId: string) {
    const t = await this.tickets.findByPk(ticketId);
    if (!t) throw new Error('attachments.ticket.not_found');
    return { companyId: t.companyId, siteId: t.siteId, status: t.status, reporterId: t.reporterId, assigneeTeamId: (t as any).assigneeTeamId ?? null };
  }
}

export class SequelizeDirectoryQueryForAttachments implements DirectoryQuery {
  constructor(@InjectModel(User) private readonly users: typeof User, @InjectModel(TeamMember) private readonly members: typeof TeamMember) {}
  async getUserMeta(userId: string) {
    const u = await this.users.findByPk(userId); if (!u) throw new Error('attachments.user.not_found');
    return { companyId: u.companyId, role: u.role as any, active: u.active };
  }
  async isUserInTeam(userId: string, teamId: string): Promise<boolean> {
    return !!(await this.members.findOne({ where: { userId, teamId } as any }));
  }
}

export class SequelizeTicketEventCommand implements TicketEventCommand {
  constructor(@InjectModel(TicketEvent) private readonly events: typeof TicketEvent) {}
  async appendEvent(p: { ticketId: string; actorUserId: string; type: string; payload?: unknown }): Promise<void> {
    await this.events.create({ ticketId: p.ticketId, actorUserId: p.actorUserId, type: p.type, payload: p.payload as any } as any);
  }
}

