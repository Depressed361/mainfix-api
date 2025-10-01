import type { SlaType } from './SlaTarget';

export interface SlaBreachEntity {
  id: string;
  ticketId: string;
  type: SlaType;
  detectedAt: Date;
  delayMs: number;
  createdAt: Date;
  notified?: boolean;
}

