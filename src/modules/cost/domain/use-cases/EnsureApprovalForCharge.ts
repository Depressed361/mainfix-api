import type { ApprovalsCommand, ApprovalsQuery, ContractsQuery, TicketsQuery, UUID } from '../ports';
import { parseApprovalThresholdEUR } from '../policies';

export class EnsureApprovalForCharge {
  constructor(private readonly tickets: TicketsQuery, private readonly contracts: ContractsQuery, private readonly approvalsQ: ApprovalsQuery, private readonly approvalsC: ApprovalsCommand) {}
  async execute(p: { ticketId: UUID; amountEstimate?: string; reason?: string; currency?: string }) {
    const status = await this.approvalsQ.getApprovalStatusForTicket(p.ticketId);
    if (status === 'APPROVED' || status === 'PENDING') return; // already handled
    const meta = await this.tickets.getTicketMeta(p.ticketId);
    if (meta.contractVersionId) {
      const rules = await this.contracts.getApprovalRules(meta.contractVersionId);
      const threshold = parseApprovalThresholdEUR(rules);
      if (threshold && p.amountEstimate && Number(p.amountEstimate) >= Number(threshold)) {
        await this.approvalsC.evaluateApprovalNeed({ ticketId: p.ticketId, reason: p.reason ?? 'COST_THRESHOLD', amountEstimate: p.amountEstimate, currency: p.currency ?? 'EUR' });
      }
    }
  }
}

