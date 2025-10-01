import type { AdminScopeGuard, FileImporter, WellBeingScoreRepository } from '../ports';

export class ImportSiteScores {
  constructor(private readonly repo: WellBeingScoreRepository, private readonly importer: FileImporter, private readonly guard: AdminScopeGuard) {}
  async execute(actorUserId: string, p: { path: string }) {
    const rows = await this.importer.parseCsv({ path: p.path });
    let upserts = 0;
    for (const r of rows) {
      if (!(await this.guard.canAccessSite(actorUserId, r.siteId))) continue;
      await this.repo.upsert({ siteId: r.siteId, periodStart: r.periodStart, periodEnd: r.periodEnd, averageRating: r.averageRating, nbSurveys: r.nbSurveys });
      upserts += 1;
    }
    return { upserts };
  }
}

