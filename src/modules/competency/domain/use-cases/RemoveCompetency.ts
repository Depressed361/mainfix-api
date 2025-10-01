import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { CompetencyMatrixRepository, ContractQuery, CatalogQuery, TeamQuery, UUID, TimeWindow } from '../ports';
import { assertSameCompany } from '../policies';

export class RemoveCompetency {
  constructor(
    private readonly matrix: CompetencyMatrixRepository,
    private readonly contracts: ContractQuery,
    private readonly catalog: CatalogQuery,
    private readonly teams: TeamQuery,
  ) {}

  async execute(
    actor: AuthenticatedActor,
    key: { contractVersionId: UUID; teamId: UUID; categoryId: UUID; buildingId: UUID | null; window: TimeWindow },
  ) {
    await assertSameCompany(actor, { contracts: this.contracts, catalog: this.catalog, teams: this.teams }, key);
    await this.matrix.deleteByUniqueKey(key);
  }
}

