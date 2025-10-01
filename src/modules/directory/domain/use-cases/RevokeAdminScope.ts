import type { AdminScopeRepository, AdminScopeType } from '../ports';
import type { AuthenticatedActor } from '../../../auth/auth-actor.types';

export class RevokeAdminScope {
  constructor(private readonly repo: AdminScopeRepository) {}
  async execute(_actor: AuthenticatedActor, p: { userId: string; scope: AdminScopeType; companyId?: string; siteId?: string; buildingId?: string }) {
    await this.repo.revoke({ userId: p.userId, scope: p.scope, companyId: p.companyId ?? null, siteId: p.siteId ?? null, buildingId: p.buildingId ?? null, createdAt: new Date() });
  }
}

