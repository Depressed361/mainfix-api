import type {
  TicketEntity,
  TicketEventEntity,
  TicketCommentEntity,
  TicketLinkEntity,
  TicketPriority,
  TicketStatus,
  TicketLinkType,
} from '../domain/ports';
import { Ticket } from '../models/ticket.model';
import { TicketEvent } from '../models/ticket-event.model';
import { TicketComment } from '../ticket-comment.model';
import { TicketLink } from '../models/ticket-link.model';

export const toDomainTicket = (m: Ticket): TicketEntity => ({
  id: m.id,
  number: m.number,
  companyId: m.companyId,
  siteId: m.siteId,
  buildingId: m.buildingId ?? null,
  locationId: m.locationId ?? null,
  assetId: m.assetId ?? null,
  categoryId: m.categoryId,
  reporterId: m.reporterId,
  assigneeTeamId: m.assigneeTeamId ?? null,
  status: m.status as TicketStatus,
  priority: m.priority as TicketPriority,
  title: m.title ?? '',
  description: m.description ?? null,
  createdAt: m.createdAt,
  ackAt: m.ackAt ?? null,
  resolvedAt: m.resolvedAt ?? null,
  validatedAt: (m as any).validatedAt ?? null,
  closedAt: (m as any).closedAt ?? null,
  ackDueAt: m.slaAckDeadline ?? null,
  resolveDueAt: m.slaResolveDeadline ?? null,
  contractId: m.contractId ?? null,
  contractVersion: m.contractVersion ?? null,
  contractSnapshot: m.contractSnapshot ?? {
    contractVersionId: (m.contractId as any) ?? '',
    contractId: m.contractId ?? '',
    version: m.contractVersion ?? 0,
    siteId: m.siteId,
    coverage: {},
    escalation: null,
    approvals: null,
    categories: [],
  },
});

export const toDomainEvent = (e: TicketEvent): TicketEventEntity => ({
  id: e.id,
  ticketId: e.ticketId,
  type: e.type as any,
  actorUserId: e.actorUserId ?? '',
  payload: e.payload ?? undefined,
  createdAt: e.createdAt,
});
export const toDomainComment = (c: TicketComment): TicketCommentEntity => ({
  id: c.id,
  ticketId: c.ticketId,
  authorUserId: c.authorUserId,
  body: c.body,
  createdAt: c.createdAt,
});
export const toDomainLink = (l: TicketLink): TicketLinkEntity => ({
  id: `${l.parentTicketId}->${l.childTicketId}`,
  sourceTicketId: l.parentTicketId,
  targetTicketId: l.childTicketId,
  type: (l.relation === 'parent-child'
    ? 'parent'
    : (l.relation as any)) as TicketLinkType,
  createdAt: new Date(0),
});
