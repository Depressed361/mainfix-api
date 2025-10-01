import type { CompanyRepository } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import { ConflictError } from '../errors';

export class DeleteCompany {
  constructor(private readonly repo: CompanyRepository) {}
  async execute(_actor: AuthenticatedActor, id: string) {
    const checks = await Promise.all([
      this.repo.hasSites(id),
      this.repo.hasUsers(id),
      this.repo.hasTeams(id),
      this.repo.hasContracts(id),
      this.repo.hasTickets(id),
    ]);
    const locked = checks.some(Boolean);
    if (locked) throw new ConflictError('companies.delete_conflict');
    await this.repo.deleteById(id);
  }
}

