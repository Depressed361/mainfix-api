import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { ContractRepository } from '../ports';
import type { UUID } from '../types';

export class CreateContract {
  constructor(private readonly contracts: ContractRepository) {}
  execute(_actor: AuthenticatedActor, p: { siteId: UUID; providerCompanyId?: UUID | null; name: string }) {
    return this.contracts.create({ siteId: p.siteId, providerCompanyId: p.providerCompanyId ?? null, name: p.name, active: true });
  }
}

