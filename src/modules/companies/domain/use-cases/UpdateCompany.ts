import type { CompanyRepository } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';

export class UpdateCompany {
  constructor(private readonly repo: CompanyRepository) {}
  execute(_actor: AuthenticatedActor, id: string, patch: { name?: string }) {
    return this.repo.update(id, patch);
  }
}

