import type { RseReportEntity } from '../domain/entities/RseReport';
import { RseReport } from '../models/rse-report.model';

export const toDomainReport = (m: RseReport): RseReportEntity => ({
  id: m.id,
  companyId: m.companyId,
  periodStart: m.periodStart,
  periodEnd: m.periodEnd,
  satisfactionAvg: m.satisfactionAvg != null ? Number(m.satisfactionAvg) : null,
  comfortIndexAvg: m.comfortIndexAvg != null ? Number(m.comfortIndexAvg) : null,
  ergonomicsTicketsCount: m.ergonomicsTicketsCount,
  resolvedRatio: m.resolvedRatio != null ? Number(m.resolvedRatio) : null,
  exportPath: m.exportPath ?? null,
  createdAt: m.createdAt,
});

