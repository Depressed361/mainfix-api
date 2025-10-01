import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Op } from 'sequelize';
import type { RseReportRepository } from '../domain/ports';
import type { RseReportEntity } from '../domain/entities/RseReport';
import { RseReport } from '../models/rse-report.model';
import { toDomainReport } from './mappers';

export class SequelizeRseReportRepository implements RseReportRepository {
  constructor(@InjectConnection() private readonly sequelize: Sequelize, @InjectModel(RseReport) private readonly model: typeof RseReport) {}

  async upsertByPeriod(p: Omit<RseReportEntity, 'id' | 'createdAt' | 'exportPath'> & { exportPath?: string | null }): Promise<RseReportEntity> {
    const sql = `
      INSERT INTO rse_reports (company_id, period_start, period_end, satisfaction_avg, comfort_index_avg, ergonomics_tickets_count, resolved_ratio, export_path)
      VALUES (:companyId, :periodStart, :periodEnd, :satisfactionAvg, :comfortIndexAvg, :ergonomicsTicketsCount, :resolvedRatio, :exportPath)
      ON CONFLICT (company_id, period_start, period_end)
      DO UPDATE SET satisfaction_avg = EXCLUDED.satisfaction_avg,
                    comfort_index_avg = EXCLUDED.comfort_index_avg,
                    ergonomics_tickets_count = EXCLUDED.ergonomics_tickets_count,
                    resolved_ratio = EXCLUDED.resolved_ratio,
                    export_path = COALESCE(EXCLUDED.export_path, rse_reports.export_path)
      RETURNING *;
    `;
    const [row] = (await this.sequelize.query(sql, {
      type: QueryTypes.INSERT,
      replacements: {
        companyId: p.companyId,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        satisfactionAvg: p.satisfactionAvg,
        comfortIndexAvg: p.comfortIndexAvg,
        ergonomicsTicketsCount: p.ergonomicsTicketsCount,
        resolvedRatio: p.resolvedRatio,
        exportPath: p.exportPath ?? null,
      },
      plain: true,
      raw: true,
    })) as unknown as [any];
    // When using QueryTypes.INSERT with RETURNING, Sequelize returns an array-like structure; fallback to findByPeriod
    if (!row) {
      const found = await this.findByPeriod(p.companyId, p.periodStart, p.periodEnd);
      if (!found) throw new Error('reports.upsert_failed');
      return found;
    }
    return toDomainReport(this.model.build(row, { isNewRecord: false }));
  }

  async findByPeriod(companyId: string, periodStart: Date, periodEnd: Date): Promise<RseReportEntity | null> {
    const row = await this.model.findOne({ where: { companyId, periodStart, periodEnd } as any });
    return row ? toDomainReport(row) : null;
  }
  async findById(id: string): Promise<RseReportEntity | null> {
    const row = await this.model.findByPk(id);
    return row ? toDomainReport(row) : null;
  }
  async listByCompany(companyId: string, range?: { from?: Date; to?: Date; page?: number; pageSize?: number }): Promise<RseReportEntity[]> {
    const where: any = { companyId };
    if (range?.from) where.periodStart = { ...(where.periodStart ?? {}), [Op.gte]: range.from };
    if (range?.to) where.periodEnd = { ...(where.periodEnd ?? {}), [Op.lte]: range.to };
    const limit = range?.pageSize;
    const offset = range?.page && range?.pageSize ? (range.page - 1) * range.pageSize : undefined;
    const rows = await this.model.findAll({ where: where as any, order: [['periodStart', 'DESC']], limit, offset });
    return rows.map(toDomainReport);
  }
  async setExportPath(id: string, path: string): Promise<void> {
    await this.model.update({ exportPath: path } as any, { where: { id } as any });
  }
}
