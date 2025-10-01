import type { ApprovalRequestEntity, ApprovalStatus, UUID } from '../ports';

export class ApprovalRequestAggregate implements ApprovalRequestEntity {
  constructor(
    public readonly id: UUID,
    public readonly ticketId: UUID,
    public readonly status: ApprovalStatus,
    public readonly createdAt: Date,
    public readonly currency: string = 'EUR',
    public readonly reason?: string | null,
    public readonly amountEstimate?: string | null,
  ) {}
}

