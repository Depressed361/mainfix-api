import type { AdminScopeGuard, CatalogQuery, SurveysQuery, WellBeingScoreRepository } from '../ports';
import { assertValidPeriod } from '../policies';

function addDays(d: Date, days: number) { const nd = new Date(d); nd.setDate(nd.getDate() + days); return nd }
function nextPeriodStart(current: Date, granularity: 'month'|'quarter'|'year'): Date {
  const d = new Date(current);
  if (granularity === 'month') { d.setMonth(d.getMonth() + 1, 1); }
  else if (granularity === 'quarter') { d.setMonth(d.getMonth() + 3, 1); }
  else { d.setFullYear(d.getFullYear() + 1, 1, 1); }
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export class RebuildRangeForCompany {
  constructor(private readonly repo: WellBeingScoreRepository, private readonly surveys: SurveysQuery, private readonly catalog: CatalogQuery, private readonly guard: AdminScopeGuard) {}
  async execute(actorUserId: string, p: { companyId: string; periodStart: Date; periodEnd: Date; granularity: 'month'|'quarter'|'year' }) {
    assertValidPeriod(p.periodStart, p.periodEnd);
    if (!(await this.guard.canAccessCompany(actorUserId, p.companyId))) throw new Error('well_being.forbidden');
    const siteIds = await this.catalog.listSiteIdsForCompany(p.companyId);
    const results: Array<{ siteId: string; periodStart: Date; periodEnd: Date; upserted: boolean }>= [];
    for (const siteId of siteIds) {
      let start = new Date(p.periodStart.getFullYear(), p.periodStart.getMonth(), 1);
      while (start <= p.periodEnd) {
        const endCandidate = nextPeriodStart(start, p.granularity);
        const periodEnd = addDays(new Date(endCandidate.getTime() - 1), 0); // approximate end as last day of previous month/period
        const res = await this.surveys.averageBySiteAndPeriod(siteId, start, periodEnd);
        if (res) {
          await this.repo.upsert({ siteId, periodStart: start, periodEnd, averageRating: res.average.toFixed(2), nbSurveys: res.count });
          results.push({ siteId, periodStart: start, periodEnd, upserted: true });
        }
        start = endCandidate;
      }
    }
    return { processed: results.length };
  }
}

