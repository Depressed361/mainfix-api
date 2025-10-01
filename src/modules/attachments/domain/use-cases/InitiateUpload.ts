import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { DirectoryQuery, ObjectStorage, TicketQuery } from '../ports';
import { assertActorCanWriteAttachment, assertSizeAndType } from '../policies';

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '_');
}
function uuidLike() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class InitiateUpload {
  constructor(
    private readonly storage: ObjectStorage,
    private readonly dirs: DirectoryQuery,
    private readonly tickets: TicketQuery,
  ) {}

  async execute(actor: AuthenticatedActor, p: { ticketId: string; fileName: string; contentType: string; contentLength: number }) {
    await assertActorCanWriteAttachment(this.dirs, this.tickets, actor.id, p.ticketId);
    assertSizeAndType(p.contentLength, p.contentType);
    const meta = await this.tickets.getTicketMeta(p.ticketId);
    const key = `companies/${meta.companyId}/tickets/${p.ticketId}/attachments/${uuidLike()}/${safeFileName(p.fileName)}`;
    const { url, headers } = await this.storage.getPresignedUploadUrl({ storageKey: key, contentType: p.contentType, contentLength: p.contentLength, expiresSeconds: 900 });
    return { uploadUrl: url, headers, storageKey: key };
  }
}

