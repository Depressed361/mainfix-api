import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { ContractVersionRepository } from '../ports';
import type { UUID } from '../types';

export class DeleteContractVersion {
  constructor(private readonly versions: ContractVersionRepository) {}
  async execute(_actor: AuthenticatedActor, id: UUID) {
    await this.versions.deleteById(id);
  }
}

