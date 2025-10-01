import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { ForbiddenError } from './errors';

export function assertCompanyScope(actor: AuthenticatedActor, companyId: string) {
  if (actor.scopeStrings?.includes('admin:super')) return;
  if (actor.companyId === companyId) return;
  if (actor.companyScopeIds?.includes(companyId)) return;
  throw new ForbiddenError('companies.company_scope.denied');
}

