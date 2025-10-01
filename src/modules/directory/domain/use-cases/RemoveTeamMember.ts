import type { TeamMemberRepository } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';

export class RemoveTeamMember {
  constructor(private readonly members: TeamMemberRepository) {}
  async execute(_actor: AuthenticatedActor, teamId: string, userId: string) {
    await this.members.delete(teamId, userId);
  }
}

