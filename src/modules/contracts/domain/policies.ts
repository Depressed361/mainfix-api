import type { UUID } from './types';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { ForbiddenError } from './errors';

export function assertCompanyScope(actor: AuthenticatedActor, companyId: UUID) {
  if (actor.scopeStrings?.includes('admin:super')) return;
  if (actor.companyId === companyId) return;
  if (actor.companyScopeIds?.includes(companyId)) return;
  throw new ForbiddenError('contracts.company_scope.denied');
}

