import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { ContractCategoryRepository } from '../ports';
import type { UUID } from '../types';

export class RemoveContractCategory {
  constructor(private readonly cats: ContractCategoryRepository) {}
  async execute(_actor: AuthenticatedActor, contractVersionId: UUID, categoryId: UUID) {
    await this.cats.remove(contractVersionId, categoryId);
  }
}

