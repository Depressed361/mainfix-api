import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { TicketEventRepository, TicketRepository, TicketStatus } from '../ports';
import { NotFoundError } from '../errors';
import { assertValidStatusTransition } from '../policies';

export class ChangeStatus {
  constructor(private readonly tickets: TicketRepository, private readonly events: TicketEventRepository) {}
  async execute(actor: AuthenticatedActor, p: { ticketId: string; to: TicketStatus }) {
    const t = await this.tickets.findById(p.ticketId); if (!t) throw new NotFoundError('tickets.not_found');
    assertValidStatusTransition(t.status, p.to);
    await this.tickets.setStatus(p.ticketId, p.to);
    const milestones: any = {};
    if (p.to === 'assigned' && !t.ackAt) milestones.ackAt = new Date();
    if (p.to === 'resolved') milestones.resolvedAt = new Date();
    if (p.to === 'closed') milestones.closedAt = new Date();
    if (Object.keys(milestones).length > 0) await this.tickets.setMilestones(p.ticketId, milestones);
    await this.events.append({ ticketId: p.ticketId, actorUserId: actor.id, type: 'STATUS_CHANGED', payload: { from: t.status, to: p.to } });
  }
}

