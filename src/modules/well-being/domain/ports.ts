export type UUID = string;
import type { WellBeingScoreEntity } from './entities/WellBeingScore';

export interface Pagination { page?: number; pageSize?: number }

export interface WellBeingScoreRepository {
  upsert(p: Omit<WellBeingScoreEntity, 'id' | 'createdAt'>): Promise<WellBeingScoreEntity>;
  findBySiteAndPeriod(p: { siteId: UUID; periodStart: Date; periodEnd: Date }): Promise<WellBeingScoreEntity | null>;
  listBySites(p: { siteIds: UUID[]; from?: Date; to?: Date; page?: number; pageSize?: number }): Promise<{ rows: WellBeingScoreEntity[]; total: number }>;
}

export interface CatalogQuery {
  getSiteMeta(siteId: UUID): Promise<{ siteId: UUID; companyId: UUID }>;
  listSiteIdsForCompany(companyId: UUID): Promise<UUID[]>;
}

export interface SurveysQuery {
  averageBySiteAndPeriod(siteId: UUID, periodStart: Date, periodEnd: Date): Promise<{ average: number; count: number } | null>;
}

export interface FileExporter { exportCsv(input: { scores: WellBeingScoreEntity[] }): Promise<{ path: string }> }
export interface FileImporter { parseCsv(input: { path: string }): Promise<Array<{ siteId: UUID; periodStart: Date; periodEnd: Date; averageRating: string; nbSurveys: number }>> }

export interface AdminScopeGuard {
  canAccessSite(actorUserId: UUID, siteId: UUID): Promise<boolean>;
  canAccessCompany(actorUserId: UUID, companyId: UUID): Promise<boolean>;
}

export const TOKENS = {
  WellBeingScoreRepository: 'WellBeing.WellBeingScoreRepository',
  CatalogQuery: 'WellBeing.CatalogQuery',
  SurveysQuery: 'WellBeing.SurveysQuery',
  FileExporter: 'WellBeing.FileExporter',
  FileImporter: 'WellBeing.FileImporter',
  AdminScopeGuard: 'WellBeing.AdminScopeGuard',
} as const;

