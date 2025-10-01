import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Op } from 'sequelize';
import type { ComfortQuery, SatisfactionQuery, TicketKpiQuery, TaxonomyQuery, CompanyBoundaryQuery } from '../domain/ports';
import { SatisfactionSurvey } from '../../satisfaction/models/satisfaction-survey.model';
import { Ticket } from '../../tickets/models/ticket.model';
import { Category } from '../../taxonomy/models/category.model';
import { Site } from '../../catalog/models/site.model';
import { WellBeingScore } from '../../well-being/models/well-being-score.model';
import { AdminScope } from '../../directory/models/admin-scope.model';

export class SequelizeSatisfactionQuery implements SatisfactionQuery {
  constructor(@InjectModel(SatisfactionSurvey) private readonly surveys: typeof SatisfactionSurvey, @InjectModel(Ticket) private readonly tickets: typeof Ticket) {}
  async averageRating(companyId: string, periodStart: Date, periodEnd: Date): Promise<number | null> {
    const rows = await this.surveys.findAll({
      include: [{ model: this.tickets, required: true, where: { companyId } as any }],
      where: { createdAt: { [Op.gte]: periodStart as any, [Op.lte]: periodEnd as any } as any } as any,
      attributes: ['rating'],
    });
    if (rows.length === 0) return null;
    const avg = rows.reduce((acc, r) => acc + (r.rating || 0), 0) / rows.length;
    return Number(avg.toFixed(2));
  }
}

export class SequelizeComfortQuery implements ComfortQuery {
  constructor(@InjectModel(WellBeingScore) private readonly scores: typeof WellBeingScore, @InjectModel(Site) private readonly sites: typeof Site) {}
  async wellBeingCompanyAverage(companyId: string, periodStart: Date, periodEnd: Date): Promise<number | null> {
    const companySites = await this.sites.findAll({ attributes: ['id'], where: { companyId } as any });
    if (companySites.length === 0) return null;
    const siteIds = companySites.map((s) => s.id);
    const rows = await this.scores.findAll({ where: { siteId: { [Op.in]: siteIds } as any, periodStart: { [Op.gte]: periodStart as any }, periodEnd: { [Op.lte]: periodEnd as any } as any } as any });
    if (rows.length === 0) return null;
    // weighted average by nb_surveys
    let sum = 0; let weight = 0;
    for (const r of rows) { const avg = Number(r.averageRating); const w = r.nbSurveys; sum += avg * w; weight += w; }
    if (weight === 0) return null;
    const result = sum / weight;
    return Number(result.toFixed(2));
  }
}

export class SequelizeTicketKpiQuery implements TicketKpiQuery {
  constructor(@InjectModel(Ticket) private readonly tickets: typeof Ticket) {}
  async ergonomicsCreated(companyId: string, periodStart: Date, periodEnd: Date): Promise<number> {
    const count = await this.tickets.count({ where: { companyId, createdAt: { [Op.gte]: periodStart as any, [Op.lte]: periodEnd as any } as any } as any });
    return count;
  }
  async resolvedOverCreated(companyId: string, periodStart: Date, periodEnd: Date): Promise<{ resolved: number; created: number }> {
    const [created, resolved] = await Promise.all([
      this.tickets.count({ where: { companyId, createdAt: { [Op.gte]: periodStart as any, [Op.lte]: periodEnd as any } as any } as any }),
      this.tickets.count({ where: { companyId, resolvedAt: { [Op.gte]: periodStart as any, [Op.lte]: periodEnd as any } as any, status: 'resolved' } as any }),
    ]);
    return { created, resolved };
  }
}

export class SequelizeTaxonomyQuery implements TaxonomyQuery {
  constructor(@InjectModel(Category) private readonly categories: typeof Category) {}
  async getCategoryIdsByKeys(companyId: string, keys: string[]): Promise<string[]> {
    const rows = await this.categories.findAll({ where: { companyId, key: { [Op.in]: keys } as any } as any, attributes: ['id'] });
    return rows.map((r) => r.id);
  }
}

export class SequelizeCompanyBoundaryQuery implements CompanyBoundaryQuery {
  constructor(@InjectModel(AdminScope) private readonly scopes: typeof AdminScope) {}
  async canAccessCompany(companyId: string, actorUserId: string): Promise<boolean> {
    // Basic check: admin platform OR has admin scope company OR same company via any admin scope
    const rows = await this.scopes.findAll({ where: { userId: actorUserId } as any });
    return rows.some((s) => s.scope === 'platform' || (s.scope === 'company' && s.companyId === companyId));
  }
}

