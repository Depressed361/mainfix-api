import type { UUID } from '../types';

export interface ContractEntity {
  id: UUID;
  siteId: UUID;
  providerCompanyId?: UUID | null;
  name: string;
  active: boolean;
}

