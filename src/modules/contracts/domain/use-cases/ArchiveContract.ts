import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { ContractRepository } from '../ports';
import type { UUID } from '../types';

export class ArchiveContract {
  constructor(private readonly contracts: ContractRepository) {}
  async execute(_actor: AuthenticatedActor, id: UUID) {
    await this.contracts.archive(id);
  }
}

