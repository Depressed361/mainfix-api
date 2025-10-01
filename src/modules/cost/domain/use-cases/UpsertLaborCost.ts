import type { ApprovalsCommand, ContractsQuery, TicketCostRepository, TicketEventCommand, TicketsQuery, UUID, AdminScopeGuard, DirectoryQuery, TeamsQuery } from '../ports';
import { assertDecimalStringOrUndefined, parseApprovalThresholdEUR } from '../policies';

export class UpsertLaborCost {
  constructor(
    private readonly costs: TicketCostRepository,
    private readonly events: TicketEventCommand,
    private readonly tickets: TicketsQuery,
    private readonly guard: AdminScopeGuard,
    private readonly dirs: DirectoryQuery,
    private readonly teams: TeamsQuery,
    private readonly contracts: ContractsQuery,
    private readonly approvals: ApprovalsCommand,
  ) {}

  async execute(actorUserId: UUID, p: { ticketId: UUID; laborHours?: string; laborRate?: string; currency?: string }) {
    assertDecimalStringOrUndefined(p.laborHours, 'laborHours');
    assertDecimalStringOrUndefined(p.laborRate, 'laborRate');

    // access control + status
    await (await import('../policies')).assertActorCanWriteCost(this.guard, this.dirs, this.teams, this.tickets, actorUserId, p.ticketId);

    const before = await this.costs.getByTicket(p.ticketId);
    const updated = await this.costs.upsertByTicket({ ticketId: p.ticketId, laborHours: p.laborHours, laborRate: p.laborRate, currency: p.currency ?? before?.currency ?? 'EUR' });

    // Approval threshold check
    const meta = await this.tickets.getTicketMeta(p.ticketId);
    if (meta.contractVersionId) {
      const rules = await this.contracts.getApprovalRules(meta.contractVersionId);
      const threshold = parseApprovalThresholdEUR(rules);
      const total = updated.total ?? '0.00';
      if (threshold && Number(total) >= Number(threshold)) {
        await this.approvals.evaluateApprovalNeed({ ticketId: p.ticketId, reason: 'COST_THRESHOLD', amountEstimate: total, currency: updated.currency });
      }
    }

    await this.events.appendEvent({ ticketId: p.ticketId, actorUserId, type: 'COST_LABOR_UPSERTED', payload: { before, after: updated } });
    return updated;
  }
}

