import type { AdminScopeGuard, CatalogQuery, SurveysQuery, WellBeingScoreRepository } from '../ports';
import { assertValidPeriod } from '../policies';

export class UpsertSiteScore {
  constructor(
    private readonly repo: WellBeingScoreRepository,
    private readonly surveys: SurveysQuery,
    private readonly catalog: CatalogQuery,
    private readonly guard: AdminScopeGuard,
  ) {}

  async execute(actorUserId: string, p: { siteId: string; periodStart: Date; periodEnd: Date }) {
    assertValidPeriod(p.periodStart, p.periodEnd);
    const meta = await this.catalog.getSiteMeta(p.siteId);
    const allowed = await this.guard.canAccessSite(actorUserId, p.siteId);
    if (!allowed) throw new Error('well_being.forbidden');

    const res = await this.surveys.averageBySiteAndPeriod(p.siteId, p.periodStart, p.periodEnd);
    if (!res) return null; // no data → idempotent no-op
    const averageRating = res.average.toFixed(2);
    const entity = await this.repo.upsert({ siteId: p.siteId, periodStart: p.periodStart, periodEnd: p.periodEnd, averageRating, nbSurveys: res.count });
    return entity;
  }
}
