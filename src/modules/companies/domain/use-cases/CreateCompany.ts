import type { CompanyRepository } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';

export class CreateCompany {
  constructor(private readonly repo: CompanyRepository) {}
  execute(_actor: AuthenticatedActor, p: { name: string }) {
    return this.repo.create({ name: p.name });
  }
}

