import type { ContractCategoryRepository } from '../ports';
import type { UUID } from '../types';

export class ListContractCategories {
  constructor(private readonly cats: ContractCategoryRepository) {}
  execute(contractVersionId: UUID) {
    return this.cats.listByContractVersion(contractVersionId);
  }
}

