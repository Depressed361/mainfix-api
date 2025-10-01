import type { TeamMemberRepository, TeamRepository, UserRepository } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import { NotFoundError } from '../errors';
import { assertSameCompany } from '../policies';

export class AddTeamMember {
  constructor(
    private readonly members: TeamMemberRepository,
    private readonly users: UserRepository,
    private readonly teams: TeamRepository,
  ) {}

  async execute(_actor: AuthenticatedActor, teamId: string, userId: string) {
    const [user, team] = await Promise.all([this.users.findById(userId), this.teams.findById(teamId)]);
    if (!user) throw new NotFoundError('directory.user.not_found');
    if (!team) throw new NotFoundError('directory.team.not_found');
    assertSameCompany(user, team);
    if (!user.active) throw new NotFoundError('directory.user.inactive');
    if (!team.active) throw new NotFoundError('directory.team.inactive');
    await this.members.upsert({ teamId, userId });
  }
}

