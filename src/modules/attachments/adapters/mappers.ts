import type { AttachmentEntity } from '../domain/entities/Attachment';
import { TicketAttachment } from '../../tickets/ticket-attachment.model';

export const toDomainAttachment = (m: TicketAttachment): AttachmentEntity => ({
  id: m.id,
  ticketId: m.ticketId,
  storageKey: m.key,
  mimeType: (m as any).mimeType ?? null,
  sizeBytes: (m as any).sizeBytes ?? null,
  uploadedBy: (m as any).uploadedBy ?? null,
  createdAt: m.createdAt,
});

