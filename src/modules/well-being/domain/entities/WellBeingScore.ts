export interface WellBeingScoreEntity {
  id: string;
  siteId: string;
  periodStart: Date; // DATEONLY
  periodEnd: Date;   // DATEONLY
  averageRating: string; // keep DECIMAL(3,2) as string for exactness
  nbSurveys: number;
  createdAt: Date;
}

