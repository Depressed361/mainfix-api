import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type {
  CompetencyMatrixRepository,
  TaxonomyQuery,
  TeamSkillRepository,
  ContractQuery,
  CatalogQuery,
  TeamQuery,
  UUID,
  TimeWindow,
  CompetencyLevel,
} from '../ports';
import { InvalidInputError } from '../errors';
import { assertSameCompany } from '../policies';

export interface UpsertCompetencyInput {
  contractVersionId: UUID;
  teamId: UUID;
  categoryId: UUID;
  buildingId?: UUID | null;
  level: CompetencyLevel;
  window: TimeWindow;
}

export class UpsertCompetency {
  constructor(
    private readonly matrix: CompetencyMatrixRepository,
    private readonly taxonomy: TaxonomyQuery,
    private readonly teamSkills: TeamSkillRepository,
    private readonly contracts: ContractQuery,
    private readonly catalog: CatalogQuery,
    private readonly teams: TeamQuery,
  ) {}

  async execute(actor: AuthenticatedActor, input: UpsertCompetencyInput) {
    await assertSameCompany(actor, { contracts: this.contracts, catalog: this.catalog, teams: this.teams }, {
      contractVersionId: input.contractVersionId,
      teamId: input.teamId,
      buildingId: input.buildingId ?? null,
    });

    if (input.level === 'primary') {
      const required = await this.taxonomy.requiredSkillsForCategory(input.categoryId);
      const existing = await this.teamSkills.listByTeam(input.teamId);
      const have = new Set(existing.map((e) => e.skillId));
      const missing = required.filter((rid) => !have.has(rid));
      if (missing.length > 0) {
        throw new InvalidInputError('competency.missing_required_skills', `Missing skills: ${missing.join(',')}`);
      }
    }

    const rec = await this.matrix.upsert({
      id: '' as any,
      contractVersionId: input.contractVersionId,
      teamId: input.teamId,
      categoryId: input.categoryId,
      buildingId: input.buildingId ?? null,
      level: input.level,
      window: input.window,
    } as any);
    return rec;
  }
}
