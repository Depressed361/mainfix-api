import type { WellBeingScoreEntity } from '../domain/entities/WellBeingScore';
import { WellBeingScore } from '../models/well-being-score.model';

export const toDomainScore = (m: WellBeingScore): WellBeingScoreEntity => ({
  id: m.id,
  siteId: m.siteId,
  periodStart: m.periodStart,
  periodEnd: m.periodEnd,
  averageRating: m.averageRating,
  nbSurveys: m.nbSurveys,
  createdAt: m.createdAt,
});

