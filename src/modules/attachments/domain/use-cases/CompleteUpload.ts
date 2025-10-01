import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { AntiVirusScanner, AttachmentRepository, DirectoryQuery, MimeSniffer, ObjectStorage, TicketEventCommand, TicketQuery } from '../ports';
import { ConflictError, InvalidInputError } from '../errors';
import { assertActorCanWriteAttachment, assertSizeAndType } from '../policies';

export class CompleteUpload {
  constructor(
    private readonly repo: AttachmentRepository,
    private readonly storage: ObjectStorage,
    private readonly av: AntiVirusScanner,
    private readonly sniffer: MimeSniffer,
    private readonly dirs: DirectoryQuery,
    private readonly tickets: TicketQuery,
    private readonly events: TicketEventCommand,
  ) {}

  async execute(actor: AuthenticatedActor, p: { ticketId: string; storageKey: string }) {
    await assertActorCanWriteAttachment(this.dirs, this.tickets, actor.id, p.ticketId);
    const exists = await this.repo.existsByTicketAndKey(p.ticketId, p.storageKey);
    if (exists) throw new ConflictError('attachments.duplicate_key');
    const head = await this.storage.headObject(p.storageKey);
    const sniffed = await this.sniffer.sniff(p.storageKey);
    assertSizeAndType(head.contentLength, sniffed);
    const result = await this.av.scanObject(p.storageKey);
    if (!('clean' in result) || result.clean !== true) {
      await this.storage.deleteObject(p.storageKey).catch(() => {});
      throw new InvalidInputError('attachments.virus_detected');
    }
    const created = await this.repo.create({ ticketId: p.ticketId, storageKey: p.storageKey, mimeType: sniffed, sizeBytes: head.contentLength, uploadedBy: actor.id });
    await this.events.appendEvent({ ticketId: p.ticketId, actorUserId: actor.id, type: 'ATTACHMENT_ADDED', payload: { attachmentId: created.id, storageKey: created.storageKey, mimeType: created.mimeType, sizeBytes: created.sizeBytes } });
    return created;
  }
}

