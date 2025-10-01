import type { TeamRepository, TeamType } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';

export class UpdateTeam {
  constructor(private readonly teams: TeamRepository) {}
  execute(_actor: AuthenticatedActor, id: string, patch: { name?: string; type?: TeamType; active?: boolean }) {
    return this.teams.update(id, patch);
  }
}

