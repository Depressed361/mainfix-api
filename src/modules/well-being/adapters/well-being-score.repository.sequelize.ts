import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import type { WellBeingScoreRepository } from '../domain/ports';
import { WellBeingScore } from '../models/well-being-score.model';
import { toDomainScore } from './mappers';

export class SequelizeWellBeingScoreRepository implements WellBeingScoreRepository {
  constructor(@InjectModel(WellBeingScore) private readonly model: typeof WellBeingScore) {}
  async upsert(p: { siteId: string; periodStart: Date; periodEnd: Date; averageRating: string; nbSurveys: number }) {
    const existing = await this.model.findOne({ where: { siteId: p.siteId, periodStart: p.periodStart as any, periodEnd: p.periodEnd as any } as WhereOptions<WellBeingScore> });
    if (existing) { existing.averageRating = p.averageRating; existing.nbSurveys = p.nbSurveys; await existing.save(); return toDomainScore(existing) }
    const row = await this.model.create({ siteId: p.siteId, periodStart: p.periodStart as any, periodEnd: p.periodEnd as any, averageRating: p.averageRating, nbSurveys: p.nbSurveys });
    return toDomainScore(row);
  }
  async findBySiteAndPeriod(p: { siteId: string; periodStart: Date; periodEnd: Date }) {
    const row = await this.model.findOne({ where: { siteId: p.siteId, periodStart: p.periodStart as any, periodEnd: p.periodEnd as any } as WhereOptions<WellBeingScore> });
    return row ? toDomainScore(row) : null;
  }
  async listBySites(p: { siteIds: string[]; from?: Date; to?: Date; page?: number; pageSize?: number }) {
    const where: WhereOptions<WellBeingScore> = { siteId: { [Op.in]: p.siteIds } } as any;
    if (p.from) (where as any).periodStart = { ...(where as any).periodStart, [Op.gte]: p.from };
    if (p.to) (where as any).periodEnd = { ...(where as any).periodEnd, [Op.lte]: p.to };
    const limit = p.pageSize; const offset = p.page && p.pageSize ? (p.page - 1) * p.pageSize : undefined;
    const { rows, count } = await this.model.findAndCountAll({ where, order: [['periodStart','DESC']], limit, offset });
    return { rows: rows.map(toDomainScore), total: count };
  }
}

