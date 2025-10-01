import type { TeamZoneRepository, UUID, Pagination } from '../ports';

export class ListTeamZones {
  constructor(private readonly zones: TeamZoneRepository) {}
  execute(teamId: UUID, p?: Pagination) {
    return this.zones.listByTeam(teamId, p);
  }
}

