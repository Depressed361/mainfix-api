import type { SlaTargetEntity, SlaBreachEntity } from '../domain/ports';
import { SlaTarget } from '../sla-target.model';
import { SlaBreach } from '../sla-breach.model';
import { Ticket } from '../../tickets/models/ticket.model';

export const toDomainTarget = (m: SlaTarget): SlaTargetEntity => ({
  id: m.id,
  ticketId: m.ticketId,
  type: m.kind as any,
  dueAt: m.deadline,
  createdAt: (m as any).createdAt ?? new Date(0),
  paused: (m as any).paused ?? false,
  pausedAt: (m as any).pausedAt ?? null,
});

export const toDomainBreach = (b: SlaBreach & { slaTarget?: SlaTarget & { ticket?: Ticket } }): SlaBreachEntity => ({
  id: b.id,
  ticketId: (b.slaTarget as any)?.ticket?.id ?? (b as any).ticketId ?? '',
  type: (b.slaTarget as any)?.kind ?? 'ack',
  detectedAt: b.breachedAt,
  delayMs: (b as any).delayMs ?? 0,
  createdAt: (b as any).createdAt ?? b.breachedAt,
  notified: (b as any).notified ?? false,
});
