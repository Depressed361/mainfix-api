import type { TeamRepository, TeamType } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';

export class CreateTeam {
  constructor(private readonly teams: TeamRepository) {}
  execute(_actor: AuthenticatedActor, p: { companyId: string; name: string; type: TeamType }) {
    return this.teams.create({ companyId: p.companyId, name: p.name, type: p.type, active: true });
  }
}

