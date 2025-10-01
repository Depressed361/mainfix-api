import { ForbiddenError } from './errors';

export async function assertCompanyAccess(
  boundary: { canAccessCompany(companyId: string, actorUserId: string): Promise<boolean> },
  companyId: string,
  actorUserId: string,
) {
  const ok = await boundary.canAccessCompany(companyId, actorUserId);
  if (!ok) throw new ForbiddenError('reports.company_scope.denied');
}

