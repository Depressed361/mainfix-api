import type { UUID } from '../types';
import type { SlaByPriority } from '../types';

export interface ContractCategoryEntity {
  id: UUID;
  contractVersionId: UUID;
  categoryId: UUID;
  included: boolean;
  sla: SlaByPriority;
}

