import type { ContractCategoryRepository } from '../ports';
import { Inject } from '@nestjs/common';
import { TOKENS } from '../ports';
import type { UUID } from '../types';

export class ListContractCategories {
  constructor(@Inject(TOKENS.ContractCategoryRepository) private readonly cats: ContractCategoryRepository) {}
  execute(contractVersionId: UUID) {
    return this.cats.listByContractVersion(contractVersionId);
  }
}
