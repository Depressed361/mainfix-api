import type { TeamRepository } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';

export class ToggleTeamActive {
  constructor(private readonly teams: TeamRepository) {}
  async execute(_actor: AuthenticatedActor, id: string, active: boolean) {
    return this.teams.update(id, { active });
  }
}

