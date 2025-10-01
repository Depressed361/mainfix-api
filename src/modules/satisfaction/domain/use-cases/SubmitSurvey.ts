import type { DirectoryQuery, SatisfactionSurveyRepository, TicketsQuery } from '../ports';
import { assertCanSubmitSurvey } from '../policies';

export class SubmitSurvey {
  constructor(private readonly repo: SatisfactionSurveyRepository, private readonly tickets: TicketsQuery, private readonly dir: DirectoryQuery) {}
  async execute(actorUserId: string, p: { ticketId: string; rating: number; comment?: string }) {
    await assertCanSubmitSurvey(this.dir, this.tickets, actorUserId, p.ticketId, p.rating, p.comment);
    const created = await this.repo.upsertUnique({ ticketId: p.ticketId, respondentUserId: actorUserId, rating: p.rating, comment: p.comment ?? null });
    return created;
  }
}

