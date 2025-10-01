import type { AdminScopeGuard, WellBeingScoreRepository } from '../ports';

export class GetSiteScore {
  constructor(private readonly repo: WellBeingScoreRepository, private readonly guard: AdminScopeGuard) {}
  async execute(actorUserId: string, p: { siteId: string; periodStart: Date; periodEnd: Date }) {
    const ok = await this.guard.canAccessSite(actorUserId, p.siteId);
    if (!ok) throw new Error('well_being.forbidden');
    return this.repo.findBySiteAndPeriod(p);
  }
}

