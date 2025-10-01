import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { AttachmentRepository, DirectoryQuery, TicketQuery } from '../ports';
import { assertActorCanWriteAttachment } from '../policies';

export class ListTicketAttachments {
  constructor(private readonly repo: AttachmentRepository, private readonly dirs: DirectoryQuery, private readonly tickets: TicketQuery) {}
  async execute(actor: AuthenticatedActor, p: { ticketId: string; page?: number; pageSize?: number }) {
    // Reuse writer policy for read access; could be relaxed to reporter or any team member
    await assertActorCanWriteAttachment(this.dirs, this.tickets, actor.id, p.ticketId);
    return this.repo.listByTicket(p.ticketId, { page: p.page, pageSize: p.pageSize });
  }
}

