import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { TicketCommentRepository, TicketEventRepository } from '../ports';

export class AddComment {
  constructor(private readonly comments: TicketCommentRepository, private readonly events: TicketEventRepository) {}
  async execute(actor: AuthenticatedActor, p: { ticketId: string; body: string }) {
    const c = await this.comments.create({ ticketId: p.ticketId, authorUserId: actor.id, body: p.body });
    await this.events.append({ ticketId: p.ticketId, actorUserId: actor.id, type: 'COMMENTED', payload: { commentId: c.id } });
    return c;
  }
}

