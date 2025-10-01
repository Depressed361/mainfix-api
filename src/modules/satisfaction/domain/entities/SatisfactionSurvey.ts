export interface SatisfactionSurveyEntity {
  id: string;
  ticketId: string;
  respondentUserId: string;
  rating: number; // 1..5
  comment?: string | null;
  createdAt: Date;
}

