import type { AdminScopeGuard, SatisfactionSurveyRepository } from '../ports';
import { assertCanListSurveys } from '../policies';

export class ListSurveys {
  constructor(private readonly repo: SatisfactionSurveyRepository, private readonly guard: AdminScopeGuard) {}
  async execute(actorUserId: string, q: { companyId?: string; siteIds?: string[]; from?: Date; to?: Date; page?: number; pageSize?: number }) {
    await assertCanListSurveys(this.guard, actorUserId, { companyId: q.companyId, siteIds: q.siteIds });
    return this.repo.list(q);
  }
}

