export type UUID = string;
import type { SatisfactionSurveyEntity } from './entities/SatisfactionSurvey';

export interface Pagination { page?: number; pageSize?: number }

export interface SatisfactionSurveyRepository {
  upsertUnique(p: Omit<SatisfactionSurveyEntity, 'id' | 'createdAt'>): Promise<SatisfactionSurveyEntity>;
  findByTicketAndRespondent(ticketId: UUID, respondentUserId: UUID): Promise<SatisfactionSurveyEntity | null>;
  list(q: { companyId?: UUID; siteIds?: UUID[]; ticketIds?: UUID[]; respondentUserId?: UUID; from?: Date; to?: Date; page?: number; pageSize?: number }): Promise<{ rows: SatisfactionSurveyEntity[]; total: number }>;
  averages(q: { companyId?: UUID; siteIds?: UUID[]; from: Date; to: Date }): Promise<{ average: number | null; count: number }>;
}

export interface TicketsQuery { getTicketMeta(ticketId: UUID): Promise<{ companyId: UUID; siteId: UUID; reporterId: UUID; status: string }> }
export interface DirectoryQuery { getUserMeta(userId: UUID): Promise<{ companyId: UUID; role: 'occupant' | 'maintainer' | 'manager' | 'approver' | 'admin'; active: boolean }> }
export interface AdminScopeGuard { canAccessCompany(actorUserId: UUID, companyId: UUID): Promise<boolean>; canAccessSite(actorUserId: UUID, siteId: UUID): Promise<boolean> }

export const TOKENS = {
  SatisfactionSurveyRepository: 'Satisfaction.SurveyRepository',
  TicketsQuery: 'Satisfaction.TicketsQuery',
  DirectoryQuery: 'Satisfaction.DirectoryQuery',
  AdminScopeGuard: 'Satisfaction.AdminScopeGuard',
} as const;

