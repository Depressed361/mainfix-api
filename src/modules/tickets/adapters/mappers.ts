import type { TicketEntity, TicketEventEntity, TicketCommentEntity, TicketLinkEntity, TicketPriority, TicketStatus, TicketLinkType } from '../domain/ports';
import { Ticket } from '../models/ticket.model';
import { TicketEvent } from '../models/ticket-event.model';
import { TicketComment } from '../ticket-comment.model';
import { TicketLink } from '../models/ticket-link.model';

export const toDomainTicket = (m: Ticket): TicketEntity => ({
  id: m.id,
  companyId: m.companyId,
  siteId: m.siteId,
  buildingId: (m as any).buildingId ?? null,
  locationId: (m as any).locationId ?? null,
  assetId: (m as any).assetId ?? null,
  categoryId: m.categoryId,
  reporterId: (m as any).reporterId,
  assigneeTeamId: (m as any).assigneeTeamId ?? null,
  status: m.status as TicketStatus,
  priority: m.priority as TicketPriority,
  title: (m as any).title ?? '',
  description: (m as any).description ?? null,
  createdAt: m.createdAt,
  ackAt: (m as any).ackAt ?? null,
  resolvedAt: (m as any).resolvedAt ?? null,
  validatedAt: (m as any).validatedAt ?? null,
  closedAt: (m as any).closedAt ?? null,
  ackDueAt: (m as any).slaAckDeadline ?? null,
  resolveDueAt: (m as any).slaResolveDeadline ?? null,
  contractSnapshot: (m as any).contractSnapshot ?? { contractVersionId: (m as any).contractId ?? '', siteId: m.siteId, sla: { P1: { ackMinutes: 0, resolveHours: 0 }, P2: { ackMinutes: 0, resolveHours: 0 }, P3: { ackMinutes: 0, resolveHours: 0 } } },
});

export const toDomainEvent = (e: TicketEvent): TicketEventEntity => ({ id: e.id, ticketId: e.ticketId, type: e.type as any, actorUserId: (e as any).actorUserId ?? '', payload: (e as any).payload ?? undefined, createdAt: e.createdAt });
export const toDomainComment = (c: TicketComment): TicketCommentEntity => ({ id: c.id, ticketId: c.ticketId, authorUserId: c.authorUserId, body: c.body, createdAt: c.createdAt });
export const toDomainLink = (l: TicketLink): TicketLinkEntity => ({ id: `${l.parentTicketId}->${l.childTicketId}`, sourceTicketId: l.parentTicketId, targetTicketId: l.childTicketId, type: (l.relation === 'parent-child' ? 'parent' : (l.relation as any)) as TicketLinkType, createdAt: new Date(0) });
