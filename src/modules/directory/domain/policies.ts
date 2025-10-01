import type { UserEntity, TeamEntity, AdminScopeType } from './ports';
import { InvalidInputError } from './errors';

export function assertSameCompany(user: UserEntity, team: TeamEntity) {
  if (user.companyId !== team.companyId) {
    throw new InvalidInputError('directory.cross_company');
  }
}

export function validateAdminScope(scope: AdminScopeType, target: { companyId?: string | null; siteId?: string | null; buildingId?: string | null }) {
  if (scope === 'platform') {
    if (target.companyId || target.siteId || target.buildingId) throw new InvalidInputError('directory.scope.platform_target_forbidden');
    return;
  }
  if (scope === 'company') {
    if (!target.companyId) throw new InvalidInputError('directory.scope.company_missing');
    return;
  }
  if (scope === 'site') {
    if (!target.siteId) throw new InvalidInputError('directory.scope.site_missing');
    return;
  }
  if (scope === 'building') {
    if (!target.buildingId) throw new InvalidInputError('directory.scope.building_missing');
    return;
  }
}

