import type { AdminScopeGuard, ApprovalRequestRepository, ContractsQuery, CostQuery, TicketEventCommand, TicketsQuery, UUID } from '../ports';
import { shouldTriggerApproval } from '../policies';

export class EvaluateApprovalNeed {
  constructor(
    private readonly approvals: ApprovalRequestRepository,
    private readonly tickets: TicketsQuery,
    private readonly contracts: ContractsQuery,
    private readonly costs: CostQuery,
    private readonly events: TicketEventCommand,
  ) {}

  // Idempotent: returns existing pending if already present; otherwise may create one if threshold reached.
  async execute(actorUserId: UUID, p: { ticketId: UUID; reason?: string }): Promise<{ created: boolean; approvalRequestId?: UUID } | { created: false; approvalRequestId?: UUID }> {
    const pending = await this.approvals.findPendingByTicket(p.ticketId);
    if (pending) return { created: false, approvalRequestId: pending.id };

    const meta = await this.tickets.getTicketMeta(p.ticketId);
    const rules = await this.contracts.getApprovalRules(meta.contractVersionId);
    const amount = await this.costs.estimateForTicket(p.ticketId);
    const trigger = shouldTriggerApproval(amount, { ticket: { companyId: meta.companyId, siteId: meta.siteId, buildingId: meta.buildingId ?? null, categoryId: meta.categoryId, priority: meta.priority }, rules });

    if (!trigger) return { created: false };

    const created = await this.approvals.create({ ticketId: p.ticketId, amountEstimate: amount ?? null, currency: 'EUR', reason: p.reason ?? null });
    await this.events.appendEvent({ ticketId: p.ticketId, actorUserId, type: 'APPROVAL_REQUESTED', payload: { approvalRequestId: created.id, amountEstimate: created.amountEstimate, currency: created.currency, reason: created.reason } });
    return { created: true, approvalRequestId: created.id };
  }
}

