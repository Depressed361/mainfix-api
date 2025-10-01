import type { AdminScopeGuard, WellBeingScoreRepository } from '../ports';

export class ListSiteScores {
  constructor(private readonly repo: WellBeingScoreRepository, private readonly guard: AdminScopeGuard) {}
  async execute(actorUserId: string, p: { siteIds: string[]; from?: Date; to?: Date; page?: number; pageSize?: number }) {
    for (const siteId of p.siteIds) {
      const ok = await this.guard.canAccessSite(actorUserId, siteId);
      if (!ok) throw new Error('well_being.forbidden');
    }
    return this.repo.listBySites(p);
  }
}

