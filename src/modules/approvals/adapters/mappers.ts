import type { ApprovalRequestEntity } from '../domain/ports';
import { ApprovalRequest } from '../approval-request.model';

export const toDomainApproval = (m: ApprovalRequest): ApprovalRequestEntity => ({
  id: m.id,
  ticketId: m.ticketId,
  reason: m.reason ?? null,
  amountEstimate: (m as any).amountEstimate ?? null,
  currency: m.currency,
  status: m.status as any,
  createdAt: m.createdAt,
});

