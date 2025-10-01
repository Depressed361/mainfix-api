import type { AdminScopeRepository, AdminScopeType } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import { validateAdminScope } from '../policies';

export class GrantAdminScope {
  constructor(private readonly repo: AdminScopeRepository) {}
  execute(_actor: AuthenticatedActor, p: { userId: string; scope: AdminScopeType; companyId?: string; siteId?: string; buildingId?: string }) {
    validateAdminScope(p.scope, { companyId: p.companyId ?? null, siteId: p.siteId ?? null, buildingId: p.buildingId ?? null });
    return this.repo.grant({ userId: p.userId, scope: p.scope, companyId: p.companyId ?? null, siteId: p.siteId ?? null, buildingId: p.buildingId ?? null, createdAt: new Date() });
  }
}

