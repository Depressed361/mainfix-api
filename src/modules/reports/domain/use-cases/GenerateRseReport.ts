import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { RseReportRepository, CompanyBoundaryQuery, SatisfactionQuery, ComfortQuery, TicketKpiQuery, TaxonomyQuery } from '../ports';
import { assertCompanyAccess } from '../policies';

export class GenerateRseReport {
  constructor(
    private readonly repo: RseReportRepository,
    private readonly boundary: CompanyBoundaryQuery,
    private readonly satisfaction: SatisfactionQuery,
    private readonly comfort: ComfortQuery,
    private readonly kpi: TicketKpiQuery,
    private readonly taxonomy: TaxonomyQuery,
  ) {}

  async execute(actor: AuthenticatedActor, p: { companyId: string; periodStart: Date; periodEnd: Date }) {
    await assertCompanyAccess(this.boundary, p.companyId, actor.id);
    const [satisfactionAvg, comfortIndexAvg, createdResolved] = await Promise.all([
      this.satisfaction.averageRating(p.companyId, p.periodStart, p.periodEnd),
      this.comfort.wellBeingCompanyAverage(p.companyId, p.periodStart, p.periodEnd),
      this.kpi.resolvedOverCreated(p.companyId, p.periodStart, p.periodEnd),
    ]);

    // ergonomics tickets
    const erKeys = ['ergonomics'];
    const erIds = await this.taxonomy.getCategoryIdsByKeys(p.companyId, erKeys);
    let ergonomicsTicketsCount = 0;
    if (erIds.length > 0) {
      ergonomicsTicketsCount = await this.kpi.ergonomicsCreated(p.companyId, p.periodStart, p.periodEnd);
    }

    const { created, resolved } = createdResolved;
    const resolvedRatio = created > 0 ? resolved / created : null;

    const report = await this.repo.upsertByPeriod({
      companyId: p.companyId,
      periodStart: p.periodStart,
      periodEnd: p.periodEnd,
      satisfactionAvg: satisfactionAvg ?? null,
      comfortIndexAvg: comfortIndexAvg ?? null,
      ergonomicsTicketsCount,
      resolvedRatio,
    });
    return report;
  }
}

