import type { TicketCostEntity, TicketPartEntity } from '../domain/ports';
import { TicketCost } from '../models/ticket-cost.model';
import { TicketPart } from '../models/ticket-part.model';

export const toDomainCost = (m: TicketCost): TicketCostEntity => ({
  id: m.id,
  ticketId: m.ticketId,
  laborHours: (m as any).laborHours ?? null,
  laborRate: (m as any).laborRate ?? null,
  partsCost: (m as any).partsCost ?? null,
  total: (m as any).total ?? null,
  currency: m.currency,
  createdAt: m.createdAt,
});

export const toDomainPart = (m: TicketPart): TicketPartEntity => ({
  id: m.id,
  ticketId: m.ticketId,
  sku: m.sku ?? null,
  label: m.label ?? null,
  qty: (m as any).qty ?? null,
  unitCost: (m as any).unitCost ?? null,
});

