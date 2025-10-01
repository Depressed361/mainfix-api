import type { DirectoryQuery, TicketsQuery } from './ports';
import { ForbiddenError, InvalidInputError } from './errors';

const ELIGIBLE_STATUSES = new Set(['resolved', 'closed', 'awaiting_confirmation']);

export async function assertCanSubmitSurvey(
  dir: DirectoryQuery,
  tickets: TicketsQuery,
  actorUserId: string,
  ticketId: string,
  rating: number,
  comment?: string,
) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new InvalidInputError('satisfaction.rating.invalid');
  if (comment && comment.length > 2000) throw new InvalidInputError('satisfaction.comment.too_long');
  const [actor, ticket] = await Promise.all([dir.getUserMeta(actorUserId), tickets.getTicketMeta(ticketId)]);
  if (actor.companyId !== ticket.companyId) throw new ForbiddenError('satisfaction.company_scope.denied');
  if (!actor.active) throw new ForbiddenError('satisfaction.actor.inactive');
  if (actorUserId !== ticket.reporterId) throw new ForbiddenError('satisfaction.only_reporter_can_submit');
  if (!ELIGIBLE_STATUSES.has(ticket.status)) throw new InvalidInputError('satisfaction.ticket.not_eligible');
}

export async function assertCanListSurveys(guard: { canAccessCompany(actorUserId: string, companyId: string): Promise<boolean>; canAccessSite(actorUserId: string, siteId: string): Promise<boolean> }, actorUserId: string, filters: { companyId?: string; siteIds?: string[] }) {
  if (filters.companyId) {
    const ok = await guard.canAccessCompany(actorUserId, filters.companyId);
    if (!ok) throw new ForbiddenError('satisfaction.company_scope.denied');
  }
  if (filters.siteIds && filters.siteIds.length) {
    for (const s of filters.siteIds) {
      const ok = await guard.canAccessSite(actorUserId, s);
      if (!ok) throw new ForbiddenError('satisfaction.site_scope.denied');
    }
  }
}

