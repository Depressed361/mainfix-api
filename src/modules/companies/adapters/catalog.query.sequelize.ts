import { InjectModel } from '@nestjs/sequelize';
import type { CatalogQuery } from '../domain/ports';
import { Site } from '../../catalog/models/site.model';

export class SequelizeCatalogQuery implements CatalogQuery {
  constructor(@InjectModel(Site) private readonly sites: typeof Site) {}
  async getSiteMeta(
    siteId: string,
  ): Promise<{ siteId: string; companyId: string }> {
    const s = await this.sites.findByPk(siteId);
    if (!s) throw new Error('companies.site.not_found');
    return {
      siteId: s.getDataValue('id'),
      companyId: s.getDataValue('companyId'),
    };
  }
}
