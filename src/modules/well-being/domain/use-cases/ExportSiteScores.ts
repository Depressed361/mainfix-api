import type { AdminScopeGuard, FileExporter, WellBeingScoreRepository } from '../ports';

export class ExportSiteScores {
  constructor(private readonly repo: WellBeingScoreRepository, private readonly exporter: FileExporter, private readonly guard: AdminScopeGuard) {}
  async execute(actorUserId: string, p: { siteIds: string[]; from?: Date; to?: Date; page?: number; pageSize?: number }) {
    for (const s of p.siteIds) {
      if (!(await this.guard.canAccessSite(actorUserId, s))) throw new Error('well_being.forbidden');
    }
    const { rows } = await this.repo.listBySites(p);
    return this.exporter.exportCsv({ scores: rows });
  }
}

