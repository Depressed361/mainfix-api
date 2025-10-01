import type { RseReportRepository } from '../ports';

export class ListRseReports {
  constructor(private readonly repo: RseReportRepository) {}
  execute(companyId: string, q?: { from?: Date; to?: Date; page?: number; pageSize?: number }) {
    return this.repo.listByCompany(companyId, q);
  }
}

