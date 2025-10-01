export type UUID = string;
import type { RseReportEntity } from './entities/RseReport';

export interface Pagination { page?: number; pageSize?: number }

export interface RseReportRepository {
  upsertByPeriod(p: Omit<RseReportEntity, 'id' | 'createdAt' | 'exportPath'> & { exportPath?: string | null }): Promise<RseReportEntity>;
  findByPeriod(companyId: UUID, periodStart: Date, periodEnd: Date): Promise<RseReportEntity | null>;
  findById(id: UUID): Promise<RseReportEntity | null>;
  listByCompany(companyId: UUID, range?: { from?: Date; to?: Date } & Pagination): Promise<RseReportEntity[]>;
  setExportPath(id: UUID, path: string): Promise<void>;
}

export interface CompanyBoundaryQuery {
  canAccessCompany(companyId: UUID, actorUserId: UUID): Promise<boolean>;
}

export interface SatisfactionQuery {
  averageRating(companyId: UUID, periodStart: Date, periodEnd: Date): Promise<number | null>;
}

export interface ComfortQuery {
  wellBeingCompanyAverage(companyId: UUID, periodStart: Date, periodEnd: Date): Promise<number | null>;
}

export interface TicketKpiQuery {
  ergonomicsCreated(companyId: UUID, periodStart: Date, periodEnd: Date): Promise<number>;
  resolvedOverCreated(companyId: UUID, periodStart: Date, periodEnd: Date): Promise<{ resolved: number; created: number }>;
}

export interface TaxonomyQuery {
  getCategoryIdsByKeys(companyId: UUID, keys: string[]): Promise<UUID[]>;
}

export interface FileExporter {
  exportRseReport(params: { report: RseReportEntity; format: 'csv' | 'pdf' }): Promise<{ path: string }>;
}

export const TOKENS = {
  RseReportRepository: 'Reports.RseReportRepository',
  CompanyBoundaryQuery: 'Reports.CompanyBoundaryQuery',
  SatisfactionQuery: 'Reports.SatisfactionQuery',
  ComfortQuery: 'Reports.ComfortQuery',
  TicketKpiQuery: 'Reports.TicketKpiQuery',
  TaxonomyQuery: 'Reports.TaxonomyQuery',
  FileExporter: 'Reports.FileExporter',
} as const;

