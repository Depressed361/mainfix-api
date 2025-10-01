import type { AdminScopeGuard, CatalogQuery, WellBeingScoreRepository } from '../ports';

export class GetCompanyAverage {
  constructor(private readonly repo: WellBeingScoreRepository, private readonly catalog: CatalogQuery, private readonly guard: AdminScopeGuard) {}
  async execute(actorUserId: string, p: { companyId: string; periodStart: Date; periodEnd: Date }) {
    if (!(await this.guard.canAccessCompany(actorUserId, p.companyId))) throw new Error('well_being.forbidden');
    const siteIds = await this.catalog.listSiteIdsForCompany(p.companyId);
    if (siteIds.length === 0) return null;
    const { rows } = await this.repo.listBySites({ siteIds, from: p.periodStart, to: p.periodEnd });
    let sum = 0; let weight = 0;
    for (const r of rows) { const avg = Number(r.averageRating); const n = r.nbSurveys; sum += avg * n; weight += n; }
    if (weight === 0) return null;
    return Number((sum / weight).toFixed(2));
  }
}

