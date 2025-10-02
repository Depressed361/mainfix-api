import type { AdminScopeGuard, ApprovalsCommand, ApprovalsQuery, DirectoryQuery, TeamsQuery, TicketEventCommand, TicketPartRepository, TicketCostRepository, TicketsQuery, UUID } from '../ports';
import { assertDecimalStringOrUndefined, isTravelLike, mul, assertActorCanWriteCost } from '../policies';

export class AddOrUpdatePart {
  constructor(
    private readonly parts: TicketPartRepository,
    private readonly costs: TicketCostRepository,
    private readonly events: TicketEventCommand,
    private readonly tickets: TicketsQuery,
    private readonly guard: AdminScopeGuard,
    private readonly dirs: DirectoryQuery,
    private readonly teams: TeamsQuery,
    private readonly approvalsQ: ApprovalsQuery,
    private readonly approvalsC: ApprovalsCommand,
  ) {}

  async execute(actorUserId: UUID, p: { ticketId: UUID; id?: UUID; sku?: string; label?: string; qty: string; unitCost: string; currency?: string }) {
    assertDecimalStringOrUndefined(p.qty, 'qty');
    assertDecimalStringOrUndefined(p.unitCost, 'unitCost');
    await assertActorCanWriteCost(this.guard, this.dirs, this.teams, this.tickets, actorUserId, p.ticketId);

    const beforeCost = await this.costs.getByTicket(p.ticketId);
    const saved = await this.parts.addOrUpdate({ id: p.id, ticketId: p.ticketId, sku: p.sku, label: p.label, qty: p.qty, unitCost: p.unitCost });

    // Recalculate parts cost
    const sum = await this.parts.sumPartsCost(p.ticketId);
    await this.costs.setPartsCost(p.ticketId, sum);
    const afterCost = await this.costs.getByTicket(p.ticketId);

    await this.events.appendEvent({ ticketId: p.ticketId, actorUserId, type: 'COST_PART_UPSERTED', payload: { part: saved } });
    await this.events.appendEvent({ ticketId: p.ticketId, actorUserId, type: 'COST_RECALCULATED', payload: { before: beforeCost, after: afterCost, partsCost: sum } });

    // Travel policy
    if (isTravelLike(p.sku, p.label)) {
      const lineTotal = mul(p.qty, p.unitCost);
      const status = await this.approvalsQ.getApprovalStatusForTicket(p.ticketId);
      if (status === 'NONE') {
        await this.approvalsC.evaluateApprovalNeed({ ticketId: p.ticketId, reason: 'TRAVEL_FEE', amountEstimate: lineTotal, currency: (afterCost?.currency ?? p.currency ?? 'EUR') });
      } else if (status === 'PENDING' || status === 'REJECTED') {
        const err = new Error('cost.approval_required'); (err as any).code = 'cost.approval_required'; throw err;
      }
    }

    return { part: saved, cost: afterCost };
  }
}
