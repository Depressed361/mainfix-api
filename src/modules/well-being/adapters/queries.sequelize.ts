import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import type { CatalogQuery, SurveysQuery } from '../domain/ports';
import { Site } from '../../catalog/models/site.model';
import { Sequelize } from 'sequelize-typescript';

export class SequelizeCatalogQuery implements CatalogQuery {
  constructor(@InjectModel(Site) private readonly sites: typeof Site) {}
  async getSiteMeta(siteId: string) { const s = await this.sites.findByPk(siteId); if (!s) throw new Error('well_being.site_not_found'); return { siteId: s.id, companyId: s.companyId } }
  async listSiteIdsForCompany(companyId: string) { const rows = await this.sites.findAll({ where: { companyId } as any, attributes: ['id'] }); return rows.map((r) => r.id) }
}

export class SequelizeSurveysQuery implements SurveysQuery {
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}
  async averageBySiteAndPeriod(siteId: string, periodStart: Date, periodEnd: Date) {
    const sql = `
      SELECT AVG(s.rating)::float AS avg, COUNT(*)::int AS count
      FROM satisfaction_surveys s
      JOIN tickets t ON t.id = s.ticket_id
      WHERE t.site_id = :siteId
        AND s.created_at >= :start
        AND s.created_at <= :end
    `;
    const [row] = (await this.sequelize.query(sql, { replacements: { siteId, start: periodStart, end: periodEnd }, plain: true })) as unknown as Array<{ avg: number|null; count: number }>;
    if (!row || row.count === 0 || row.avg === null) return null;
    return { average: row.avg, count: row.count };
  }
}

