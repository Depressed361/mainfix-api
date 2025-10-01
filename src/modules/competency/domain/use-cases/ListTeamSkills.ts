import type { TeamSkillRepository, UUID, Pagination } from '../ports';

export class ListTeamSkills {
  constructor(private readonly skills: TeamSkillRepository) {}
  execute(teamId: UUID, p?: Pagination) {
    return this.skills.listByTeam(teamId, p);
  }
}

