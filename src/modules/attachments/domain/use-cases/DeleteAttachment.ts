import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { AttachmentRepository, DirectoryQuery, ObjectStorage, TicketEventCommand, TicketQuery } from '../ports';
import { NotFoundError } from '../errors';
import { assertActorCanWriteAttachment } from '../policies';

export class DeleteAttachment {
  constructor(
    private readonly repo: AttachmentRepository,
    private readonly storage: ObjectStorage,
    private readonly dirs: DirectoryQuery,
    private readonly tickets: TicketQuery,
    private readonly events: TicketEventCommand,
  ) {}
  async execute(actor: AuthenticatedActor, id: string) {
    const att = await this.repo.findById(id); if (!att) throw new NotFoundError('attachments.not_found');
    await assertActorCanWriteAttachment(this.dirs, this.tickets, actor.id, att.ticketId);
    await this.repo.deleteById(id);
    await this.storage.deleteObject(att.storageKey).catch(() => {});
    await this.events.appendEvent({ ticketId: att.ticketId, actorUserId: actor.id, type: 'ATTACHMENT_DELETED', payload: { attachmentId: id, storageKey: att.storageKey } });
  }
}

