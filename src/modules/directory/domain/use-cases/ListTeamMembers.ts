import type { TeamMemberRepository, Pagination } from '../ports';

export class ListTeamMembers {
  constructor(private readonly members: TeamMemberRepository) {}
  execute(teamId: string, p?: Pagination) {
    return this.members.listMembers(teamId, p);
  }
}

