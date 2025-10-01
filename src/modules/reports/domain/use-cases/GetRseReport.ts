import type { RseReportRepository } from '../ports';

export class GetRseReport {
  constructor(private readonly repo: RseReportRepository) {}
  execute(id: string) { return this.repo.findById(id); }
}

