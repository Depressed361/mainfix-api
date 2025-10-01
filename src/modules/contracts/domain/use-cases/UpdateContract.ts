import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { ContractRepository } from '../ports';
import type { UUID } from '../types';

export class UpdateContract {
  constructor(private readonly contracts: ContractRepository) {}
  execute(_actor: AuthenticatedActor, id: UUID, patch: { name?: string; providerCompanyId?: UUID | null }) {
    const safe = { ...patch } as any;
    delete (safe as any).siteId;
    delete (safe as any).active;
    return this.contracts.update(id, safe);
  }
}

