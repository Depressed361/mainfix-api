import type {
  ApprovalRequestEntity,
  ApprovalRequestRepository,
  TicketEventCommand,
  UUID,
} from '../ports';

export class CreateApprovalRequest {
  constructor(
    private readonly approvals: ApprovalRequestRepository,
    private readonly events: TicketEventCommand,
  ) {}

  // Explicit action; if a pending already exists for the ticket, return it (idempotent-ish behavior to keep gating simple)
  async execute(
    actorUserId: UUID,
    p: {
      ticketId: UUID;
      reason?: string;
      amountEstimate?: string | null;
      currency?: string;
    },
  ): Promise<ApprovalRequestEntity> {
    const existing = await this.approvals.findPendingByTicket(p.ticketId);
    if (existing) return existing;
    const created = await this.approvals.create({
      ticketId: p.ticketId,
      reason: p.reason ?? null,
      amountEstimate: p.amountEstimate ?? null,
      currency: p.currency ?? 'EUR',
    });
    await this.events.appendEvent({
      ticketId: p.ticketId,
      actorUserId,
      type: 'APPROVAL_REQUESTED',
      payload: {
        approvalRequestId: created.id,
        amountEstimate: created.amountEstimate,
        currency: created.currency,
        reason: created.reason,
      },
    });
    return created;
  }
}
