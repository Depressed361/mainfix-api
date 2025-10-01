import type { DirectoryQuery, TicketQuery } from './ports';
import { ForbiddenError, ConflictError, InvalidInputError } from './errors';

export async function assertActorCanWriteAttachment(
  dirs: DirectoryQuery,
  tickets: TicketQuery,
  actorUserId: string,
  ticketId: string,
) {
  const [actor, ticket] = await Promise.all([
    dirs.getUserMeta(actorUserId),
    tickets.getTicketMeta(ticketId),
  ]);
  if (actor.companyId !== ticket.companyId) throw new ForbiddenError('attachments.company_scope.denied');
  if (!actor.active) throw new ForbiddenError('attachments.actor.inactive');
  const elevated = actor.role === 'admin' || actor.role === 'manager' || actor.role === 'maintainer';
  let allowed = elevated || actorUserId === ticket.reporterId;
  if (!allowed && ticket.assigneeTeamId) {
    allowed = await dirs.isUserInTeam(actorUserId, ticket.assigneeTeamId);
  }
  if (!allowed) throw new ForbiddenError('attachments.role.denied');
  if (ticket.status === 'closed' && !(actor.role === 'admin' || actor.role === 'manager')) {
    throw new ConflictError('attachments.ticket.closed');
  }
}

export function assertSizeAndType(contentLength: number, contentType: string) {
  const MAX = 20 * 1024 * 1024; // 20MB
  if (contentLength <= 0 || contentLength > MAX) throw new InvalidInputError('attachments.size.invalid');
  const disallowed = [
    'application/x-msdownload',
    'application/x-sh',
    'application/x-bat',
    'application/x-dosexec',
    'application/x-7z-compressed',
  ];
  if (disallowed.includes(contentType)) throw new InvalidInputError('attachments.mime.disallowed');
  const allowedPrefixes = ['image/', 'text/'];
  const allowedExact = ['application/pdf'];
  if (!allowedPrefixes.some((p) => contentType.startsWith(p)) && !allowedExact.includes(contentType) && !contentType.startsWith('application/vnd.') && !contentType.startsWith('application/msword')) {
    throw new InvalidInputError('attachments.mime.unsupported');
  }
}

