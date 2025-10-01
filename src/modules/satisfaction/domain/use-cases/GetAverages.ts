import type { SatisfactionSurveyRepository } from '../ports';

export class GetAverages {
  constructor(private readonly repo: SatisfactionSurveyRepository) {}
  execute(q: { companyId?: string; siteIds?: string[]; from: Date; to: Date }) { return this.repo.averages(q) }
}

