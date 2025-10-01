export interface AttachmentEntity {
  id: string;
  ticketId: string;
  storageKey: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedBy?: string | null;
  createdAt: Date;
}

