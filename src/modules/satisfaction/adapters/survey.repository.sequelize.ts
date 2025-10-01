import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op, WhereOptions } from 'sequelize';
import type { SatisfactionSurveyRepository } from '../domain/ports';
import type { SatisfactionSurveyEntity } from '../domain/entities/SatisfactionSurvey';
import { SatisfactionSurvey } from '../models/satisfaction-survey.model';
import { Ticket } from '../../tickets/models/ticket.model';
import { toDomainSurvey } from './mappers';

export class SequelizeSatisfactionSurveyRepository implements SatisfactionSurveyRepository {
  constructor(@InjectConnection() private readonly sequelize: Sequelize, @InjectModel(SatisfactionSurvey) private readonly model: typeof SatisfactionSurvey, @InjectModel(Ticket) private readonly tickets: typeof Ticket) {}
  async upsertUnique(p: Omit<SatisfactionSurveyEntity, 'id' | 'createdAt'>): Promise<SatisfactionSurveyEntity> {
    const existing = await this.model.findOne({ where: { ticketId: p.ticketId, respondentUserId: p.respondentUserId } as any });
    if (existing) { existing.rating = p.rating; existing.comment = p.comment ?? null; await existing.save(); return toDomainSurvey(existing) }
    const row = await this.model.create({ ticketId: p.ticketId, respondentUserId: p.respondentUserId, rating: p.rating, comment: p.comment ?? null } as any);
    return toDomainSurvey(row);
  }
  async findByTicketAndRespondent(ticketId: string, respondentUserId: string) { const row = await this.model.findOne({ where: { ticketId, respondentUserId } as any }); return row ? toDomainSurvey(row) : null }
  async list(q: { companyId?: string; siteIds?: string[]; ticketIds?: string[]; respondentUserId?: string; from?: Date; to?: Date; page?: number; pageSize?: number }) {
    const where: WhereOptions<SatisfactionSurvey> = {} as any;
    if (q.respondentUserId) (where as any).respondentUserId = q.respondentUserId;
    if (q.from || q.to) (where as any).createdAt = { ...(q.from ? { [Op.gte]: q.from } : {}), ...(q.to ? { [Op.lte]: q.to } : {}) } as any;
    const include: any[] = [];
    if (q.companyId || (q.siteIds && q.siteIds.length) || (q.ticketIds && q.ticketIds.length)) {
      const tWhere: any = {};
      if (q.companyId) tWhere.companyId = q.companyId;
      if (q.siteIds && q.siteIds.length) tWhere.siteId = { [Op.in]: q.siteIds };
      if (q.ticketIds && q.ticketIds.length) tWhere.id = { [Op.in]: q.ticketIds };
      include.push({ model: this.tickets, required: true, where: tWhere });
    }
    const limit = q.pageSize; const offset = q.page && q.pageSize ? (q.page - 1) * q.pageSize : undefined;
    const { rows, count } = await this.model.findAndCountAll({ where, include: include.length ? include : undefined, order: [['createdAt','DESC']], limit, offset });
    return { rows: rows.map(toDomainSurvey), total: count };
  }
  async averages(q: { companyId?: string; siteIds?: string[]; from: Date; to: Date }): Promise<{ average: number | null; count: number }> {
    const replacements: any = { from: q.from, to: q.to };
    let sql = `SELECT AVG(s.rating)::float AS avg, COUNT(*)::int AS count FROM satisfaction_surveys s JOIN tickets t ON t.id = s.ticket_id WHERE s.created_at >= :from AND s.created_at <= :to`;
    if (q.companyId) { sql += ' AND t.company_id = :companyId'; replacements.companyId = q.companyId }
    if (q.siteIds && q.siteIds.length) { sql += ' AND t.site_id = ANY(:siteIds)'; replacements.siteIds = q.siteIds }
    const [row] = (await this.sequelize.query(sql, { plain: true, replacements })) as unknown as Array<{ avg: number | null; count: number }>;
    if (!row || row.count === 0 || row.avg === null) return { average: null, count: 0 };
    return { average: Number(row.avg.toFixed(2)), count: row.count };
  }
}

