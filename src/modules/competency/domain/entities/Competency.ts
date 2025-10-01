import type { UUID } from './TeamZone';

export type CompetencyLevel = 'primary' | 'backup';
export type TimeWindow = 'business_hours' | 'after_hours' | 'any';

export interface CompetencyRecord {
  id: UUID;
  contractVersionId: UUID;
  teamId: UUID;
  categoryId: UUID;
  buildingId: UUID | null;
  level: CompetencyLevel;
  window: TimeWindow;
}

