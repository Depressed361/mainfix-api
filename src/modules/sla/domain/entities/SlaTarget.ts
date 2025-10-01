export type SlaType = 'ack' | 'resolve';

export interface SlaTargetEntity {
  id: string;
  ticketId: string;
  type: SlaType;
  dueAt: Date;
  createdAt: Date;
  paused?: boolean;
  pausedAt?: Date | null;
}

