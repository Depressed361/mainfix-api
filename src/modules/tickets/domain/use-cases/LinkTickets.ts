import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { TicketEventRepository, TicketLinkRepository, TicketLinkType } from '../ports';

export class LinkTickets {
  constructor(private readonly links: TicketLinkRepository, private readonly events: TicketEventRepository) {}
  async execute(actor: AuthenticatedActor, p: { sourceTicketId: string; targetTicketId: string; type: TicketLinkType }) {
    const l = await this.links.create({ sourceTicketId: p.sourceTicketId, targetTicketId: p.targetTicketId, type: p.type });
    await this.events.append({ ticketId: p.sourceTicketId, actorUserId: actor.id, type: 'LINKED', payload: { linkId: l.id, target: p.targetTicketId, type: p.type } });
    return l;
  }
}

