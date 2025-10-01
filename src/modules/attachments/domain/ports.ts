export type UUID = string;
import type { AttachmentEntity } from './entities/Attachment';

export interface Pagination { page?: number; pageSize?: number }

export interface AttachmentRepository {
  create(p: { ticketId: UUID; storageKey: string; mimeType?: string | null; sizeBytes?: number | null; uploadedBy?: UUID | null }): Promise<AttachmentEntity>;
  deleteById(id: UUID): Promise<void>;
  listByTicket(ticketId: UUID, p?: Pagination): Promise<AttachmentEntity[]>;
  findById(id: UUID): Promise<AttachmentEntity | null>;
  existsByTicketAndKey(ticketId: UUID, storageKey: string): Promise<boolean>;
}

export interface ObjectStorage {
  getPresignedUploadUrl(input: { storageKey: string; contentType: string; contentLength: number; expiresSeconds?: number }): Promise<{ url: string; headers: Record<string, string> }>;
  getPresignedDownloadUrl(input: { storageKey: string; expiresSeconds?: number; responseContentDisposition?: string }): Promise<{ url: string }>;
  headObject(storageKey: string): Promise<{ contentLength: number; contentType?: string }>;
  deleteObject(storageKey: string): Promise<void>;
}

export interface AntiVirusScanner { scanObject(storageKey: string): Promise<{ clean: true } | { clean: false; virus: string }>; }
export interface MimeSniffer { sniff(storageKey: string): Promise<string> }
export interface ImageProcessor { createThumbnails(storageKey: string, opts?: { sizes?: number[] }): Promise<{ keys: string[] }> }

export interface TicketQuery {
  getTicketMeta(ticketId: UUID): Promise<{ companyId: UUID; siteId: UUID; status: string; reporterId: UUID; assigneeTeamId?: UUID | null }>;
}

export interface DirectoryQuery {
  getUserMeta(userId: UUID): Promise<{ companyId: UUID; role: 'occupant' | 'maintainer' | 'manager' | 'approver' | 'admin'; active: boolean }>;
  isUserInTeam(userId: UUID, teamId: UUID): Promise<boolean>;
}

export interface TicketEventCommand { appendEvent(p: { ticketId: UUID; actorUserId: UUID; type: string; payload?: unknown }): Promise<void> }

export const TOKENS = {
  AttachmentRepository: 'Attachments.AttachmentRepository',
  ObjectStorage: 'Attachments.ObjectStorage',
  AntiVirusScanner: 'Attachments.AntiVirusScanner',
  MimeSniffer: 'Attachments.MimeSniffer',
  ImageProcessor: 'Attachments.ImageProcessor',
  TicketQuery: 'Attachments.TicketQuery',
  DirectoryQuery: 'Attachments.DirectoryQuery',
  TicketEventCommand: 'Attachments.TicketEventCommand',
} as const;

