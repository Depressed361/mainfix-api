import type { SatisfactionSurveyEntity } from '../domain/entities/SatisfactionSurvey';
import { SatisfactionSurvey } from '../models/satisfaction-survey.model';

export const toDomainSurvey = (m: SatisfactionSurvey): SatisfactionSurveyEntity => ({
  id: m.id,
  ticketId: m.ticketId,
  respondentUserId: m.respondentUserId,
  rating: m.rating,
  comment: m.comment ?? null,
  createdAt: m.createdAt,
});

