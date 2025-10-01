import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import type { ContractVersionInfo } from './ports';
import { ForbiddenError } from './errors';

export function assertCompanyScope(actor: AuthenticatedActor, companyId: string) {
  if (actor.scopeStrings?.includes('admin:super')) return;
  if (actor.companyId === companyId) return;
  if (actor.companyScopeIds?.includes(companyId)) return;
  throw new ForbiddenError('routing.company_scope.denied', 'Company scope denied');
}

export function assertContractInCompany(actor: AuthenticatedActor, cv: ContractVersionInfo) {
  assertCompanyScope(actor, cv.companyId);
}

