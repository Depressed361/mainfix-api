import type { ContractRepository, Pagination } from '../ports';
import type { UUID } from '../types';

export class ListContracts {
  constructor(private readonly contracts: ContractRepository) {}
  execute(siteId: UUID, p?: Pagination) {
    return this.contracts.listBySite(siteId, p);
  }
}

