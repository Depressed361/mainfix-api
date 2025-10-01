import type { ApprovalRequestRepository, ApprovalStatus, UUID } from '../ports';

export class GetApprovalStatusForTicket {
  constructor(private readonly approvals: ApprovalRequestRepository) {}

  async execute(ticketId: UUID): Promise<ApprovalStatus> {
    const pending = await this.approvals.findPendingByTicket(ticketId);
    if (pending) return 'PENDING';
    const list = await this.approvals.list({ ticketIds: [ticketId], page: 1, pageSize: 1 });
    if (list.rows.length === 0) return 'APPROVED';
    return list.rows[0].status;
  }
}

