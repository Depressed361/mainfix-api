import type { DirectoryQuery, TicketEntity } from './ports';
import { ForbiddenError, InvalidInputError } from './errors';

export function computeSlaTargets(createdAt: Date, priority: 'P1'|'P2'|'P3', sla: Record<'P1'|'P2'|'P3',{ ackMinutes:number; resolveHours:number }>) {
  const ackDueAt = new Date(createdAt.getTime() + sla[priority].ackMinutes * 60 * 1000);
  const resolveDueAt = new Date(createdAt.getTime() + sla[priority].resolveHours * 3600 * 1000);
  return { ackDueAt, resolveDueAt };
}

export async function assertActorCanReadTicket(d: DirectoryQuery, actorUserId: string, ticket: TicketEntity) {
  const actor = await d.getUserMeta(actorUserId);
  if (actor.companyId !== ticket.companyId) throw new ForbiddenError('tickets.company_scope.denied');
}

export function assertValidStatusTransition(from: string, to: string) {
  const allowed: Record<string, string[]> = {
    open: ['assigned','cancelled'],
    assigned: ['in_progress','awaiting_confirmation','cancelled','resolved'],
    in_progress: ['awaiting_confirmation','resolved','cancelled'],
    awaiting_confirmation: ['in_progress','resolved','cancelled'],
    resolved: ['closed','in_progress'],
    closed: [],
    cancelled: [],
  };
  if (!allowed[from] || !allowed[from].includes(to)) throw new InvalidInputError('tickets.status.invalid_transition');
}

