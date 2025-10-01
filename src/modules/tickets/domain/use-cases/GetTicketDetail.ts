import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { TicketCommentRepository, TicketEventRepository, TicketLinkRepository, TicketRepository } from '../ports';

export class GetTicketDetail {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly events: TicketEventRepository,
    private readonly comments: TicketCommentRepository,
    private readonly links: TicketLinkRepository,
  ) {}
  async execute(_actor: AuthenticatedActor, id: string) {
    const ticket = await this.tickets.findById(id);
    if (!ticket) return null;
    const [events, comments, links] = await Promise.all([
      this.events.list(id, { page: 1, pageSize: 50 }),
      this.comments.list(id, { page: 1, pageSize: 50 }),
      this.links.list(id),
    ]);
    return { ticket, events, comments, links };
  }
}

