import { Op } from 'sequelize';
import { Site } from '../../models/site.model';
import { Building } from '../../models/buildings.model';
import { SiteRepository } from '../domain/ports';
import {
  ListSitesQuery,
  ListSitesResult,
  SiteDTO,
  SiteId,
  SiteWithBuildings,
} from '../domain/types';
import { fromCreate, toBuildingDTO, toDTO } from './mappers';

export class SequelizeSiteRepository implements SiteRepository {
  async create(input: Omit<SiteDTO, 'id'>): Promise<SiteDTO> {
    const row = await Site.create(fromCreate(input) as any);
    return toDTO(row);
  }

  async findById(id: SiteId): Promise<SiteDTO | null> {
    const row = await Site.findByPk(id);
    return row ? toDTO(row) : null;
  }

  async findWithBuildings(id: SiteId): Promise<SiteWithBuildings | null> {
    const site = await Site.findByPk(id);
    if (!site) return null;

    const buildings = await Building.findAll({
      where: { siteId: id },
      order: [['code', 'ASC']],
    });

    return {
      site: toDTO(site),
      buildings: buildings.map(toBuildingDTO),
    };
  }

  async list(query: ListSitesQuery): Promise<ListSitesResult> {
    const where: Record<string, any> & { [Op.or]?: any } = {};

    if (query.companyId) where.companyId = query.companyId;
    if (query.search) {
      const likeOperator =
        Site.sequelize?.getDialect() === 'postgres' ? Op.iLike : Op.like;
      where[Op.or] = [
        { name: { [likeOperator]: `%${query.search}%` } },
        { code: { [likeOperator]: `%${query.search}%` } },
      ];
    }

    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const offset = query.offset && query.offset >= 0 ? query.offset : 0;

    const { rows, count } = await Site.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ['name', 'ASC'],
        ['code', 'ASC'],
      ],
    });

    return { rows: rows.map(toDTO), count };
  }

  async update(
    id: SiteId,
    patch: Partial<Omit<SiteDTO, 'id'>>,
  ): Promise<SiteDTO> {
    const row = await Site.findByPk(id);
    if (!row) throw new Error('SITE_NOT_FOUND');

    await row.update(patch as any);
    return toDTO(row);
  }

  async delete(id: SiteId): Promise<void> {
    const deleted = await Site.destroy({ where: { id } });
    if (!deleted) throw new Error('SITE_NOT_FOUND');
  }
}
