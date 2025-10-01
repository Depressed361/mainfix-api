import type { CompanyRepository } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';

export class ArchiveCompany {
  constructor(private readonly repo: CompanyRepository) {}
  async execute(_actor: AuthenticatedActor, id: string) {
    await this.repo.archive(id);
  }
}

