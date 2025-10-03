import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type {
  DirectoryQuery,
  TicketEventRepository,
  TicketRepository,
} from '../ports';
import { NotFoundError } from '../errors';

export class AssignTicket {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly events: TicketEventRepository,
    private readonly dir: DirectoryQuery,
  ) {}
  async execute(
    actor: AuthenticatedActor,
    p: { ticketId: string; teamId: string | null },
  ) {
    const t = await this.tickets.findById(p.ticketId);
    if (!t) throw new NotFoundError('tickets.not_found');
    await this.tickets.setAssignee(p.ticketId, p.teamId);
    await this.events.append({
      ticketId: p.ticketId,
      actorUserId: actor.id,
      type: 'ASSIGNED',
      payload: { teamId: p.teamId },
    });
  }
}
