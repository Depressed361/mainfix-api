import type { ContractVersionRepository, Pagination } from '../ports';
import type { UUID } from '../types';

export class ListContractVersions {
  constructor(private readonly versions: ContractVersionRepository) {}
  execute(contractId: UUID, p?: Pagination) {
    return this.versions.listByContract(contractId, p);
  }
}

