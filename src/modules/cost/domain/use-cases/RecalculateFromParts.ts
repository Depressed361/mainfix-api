import type { TicketCostRepository, TicketEventCommand, TicketPartRepository, UUID } from '../ports';

export class RecalculateFromParts {
  constructor(private readonly parts: TicketPartRepository, private readonly costs: TicketCostRepository, private readonly events: TicketEventCommand) {}
  async execute(actorUserId: UUID, p: { ticketId: UUID }) {
    const before = await this.costs.getByTicket(p.ticketId);
    const sum = await this.parts.sumPartsCost(p.ticketId);
    await this.costs.setPartsCost(p.ticketId, sum);
    const after = await this.costs.getByTicket(p.ticketId);
    await this.events.appendEvent({ ticketId: p.ticketId, actorUserId, type: 'COST_RECALCULATED', payload: { before, after, partsCost: sum } });
    return after;
  }
}

