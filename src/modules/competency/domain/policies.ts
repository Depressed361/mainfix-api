import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import type { CatalogQuery, ContractQuery, TeamQuery, UUID } from './ports';
import { ForbiddenError } from './errors';

export async function assertSameCompany(
  actor: AuthenticatedActor,
  deps: { contracts: ContractQuery; catalog?: CatalogQuery; teams: TeamQuery },
  meta: { contractVersionId: UUID; teamId: UUID; buildingId?: UUID | null },
) {
  const cv = await deps.contracts.getContractVersionMeta(meta.contractVersionId);
  const team = await deps.teams.getTeamMeta(meta.teamId);
  const buildingCompanyId = meta.buildingId ? (await deps.catalog?.getBuildingMeta(meta.buildingId))?.companyId : cv.companyId;
  const companyIds = [cv.companyId, team.companyId, buildingCompanyId].filter(Boolean) as string[];
  const mismatched = companyIds.some((c) => c !== companyIds[0]);
  if (mismatched) throw new ForbiddenError('competency.company_scope.cross_company');

  // actor must have scope over the company
  const companyId = cv.companyId;
  if (
    !(actor.scopeStrings?.includes('admin:super') ||
      actor.companyId === companyId ||
      actor.companyScopeIds?.includes(companyId))
  ) {
    throw new ForbiddenError('competency.company_scope.denied');
  }
}

