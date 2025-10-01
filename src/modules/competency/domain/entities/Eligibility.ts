import type { UUID } from './TeamZone';
import type { CompetencyLevel, TimeWindow } from './Competency';

export interface EligibilityInput {
  contractVersionId: UUID;
  categoryId: UUID;
  buildingId?: UUID | null;
  timeWindow: Exclude<TimeWindow, 'any'>;
  preferLevel?: CompetencyLevel | 'any';
}

export interface EligibilityResult {
  teamIds: UUID[];
}

