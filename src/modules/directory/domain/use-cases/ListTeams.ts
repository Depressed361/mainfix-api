import type { TeamRepository, Pagination, TeamType } from '../ports';

export class ListTeams {
  constructor(private readonly teams: TeamRepository) {}
  execute(companyId: string, q?: { type?: TeamType; active?: boolean; search?: string } & Pagination) {
    return this.teams.listByCompany(companyId, q);
  }
}

