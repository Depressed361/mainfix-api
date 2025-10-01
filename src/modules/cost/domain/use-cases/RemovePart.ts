import type { AdminScopeGuard, DirectoryQuery, TeamsQuery, TicketEventCommand, TicketPartRepository, TicketCostRepository, TicketsQuery, UUID } from '../ports';

export class RemovePart {
  constructor(
    private readonly parts: TicketPartRepository,
    private readonly costs: TicketCostRepository,
    private readonly events: TicketEventCommand,
    private readonly tickets: TicketsQuery,
    private readonly guard: AdminScopeGuard,
    private readonly dirs: DirectoryQuery,
    private readonly teams: TeamsQuery,
  ) {}

  async execute(actorUserId: UUID, p: { ticketId: UUID; id: UUID }) {
    await (await import('../policies')).assertActorCanWriteCost(this.guard, this.dirs, this.teams, this.tickets, actorUserId, p.ticketId);
    const before = await this.costs.getByTicket(p.ticketId);
    await this.parts.remove({ id: p.id, ticketId: p.ticketId });
    const sum = await this.parts.sumPartsCost(p.ticketId);
    await this.costs.setPartsCost(p.ticketId, sum);
    const after = await this.costs.getByTicket(p.ticketId);
    await this.events.appendEvent({ ticketId: p.ticketId, actorUserId, type: 'COST_PART_REMOVED', payload: { partId: p.id } });
    await this.events.appendEvent({ ticketId: p.ticketId, actorUserId, type: 'COST_RECALCULATED', payload: { before, after, partsCost: sum } });
  }
}

