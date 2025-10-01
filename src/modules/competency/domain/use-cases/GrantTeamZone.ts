import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { TeamZoneRepository, ContractQuery, CatalogQuery, TeamQuery, UUID } from '../ports';
import { assertSameCompany } from '../policies';

export class GrantTeamZone {
  constructor(
    private readonly zones: TeamZoneRepository,
    private readonly contracts: ContractQuery,
    private readonly catalog: CatalogQuery,
    private readonly teams: TeamQuery,
  ) {}

  async execute(actor: AuthenticatedActor, teamId: UUID, buildingId: UUID, contractVersionId: UUID) {
    await assertSameCompany(actor, { contracts: this.contracts, catalog: this.catalog, teams: this.teams }, { contractVersionId, teamId, buildingId });
    await this.zones.upsert({ teamId, buildingId });
  }
}

