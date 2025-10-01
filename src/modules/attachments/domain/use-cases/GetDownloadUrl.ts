import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { AttachmentRepository, DirectoryQuery, ObjectStorage, TicketQuery } from '../ports';
import { NotFoundError } from '../errors';
import { assertActorCanWriteAttachment } from '../policies';

export class GetDownloadUrl {
  constructor(
    private readonly repo: AttachmentRepository,
    private readonly storage: ObjectStorage,
    private readonly dirs: DirectoryQuery,
    private readonly tickets: TicketQuery,
  ) {}
  async execute(actor: AuthenticatedActor, id: string) {
    const att = await this.repo.findById(id); if (!att) throw new NotFoundError('attachments.not_found');
    await assertActorCanWriteAttachment(this.dirs, this.tickets, actor.id, att.ticketId);
    const inline = att.mimeType?.startsWith('image/') || att.mimeType === 'application/pdf';
    const { url } = await this.storage.getPresignedDownloadUrl({ storageKey: att.storageKey, responseContentDisposition: inline ? 'inline' : 'attachment' });
    return { url };
  }
}

