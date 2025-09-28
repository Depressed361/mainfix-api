import { Op } from 'sequelize';
import { Asset } from '../../../models/asset.model';
import { Location } from '../../../models/location.model';
import { Building } from '../../../models/buildings.model';
import type { AssetDTO, ListAssetsQuery } from '../../domain/ports';
import { assetToDTO } from '../mappers';

export class SequelizeAssetListReadModel {
  async list(
    query: ListAssetsQuery,
  ): Promise<{ rows: AssetDTO[]; count: number }> {
    const whereAsset: { [key: string]: unknown; [Op.or]?: unknown } = {};
    if (query.companyId) whereAsset.companyId = query.companyId;
    if (query.search) {
      whereAsset[Op.or] = [
        { code: { [Op.iLike]: `%${query.search}%` } },
        { kind: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const whereBuilding: Record<string, unknown> = {};
    if (query.siteId) whereBuilding.siteId = query.siteId;
    if (query.buildingId) whereBuilding.id = query.buildingId;

    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const offset = query.offset && query.offset >= 0 ? query.offset : 0;

    const { rows, count } = await Asset.findAndCountAll({
      where: whereAsset,
      limit,
      offset,
      order: [['code', 'ASC']],
      include: [
        {
          model: Location,
          as: 'location',
          required: true,
          attributes: ['id', 'buildingId'],
          include: [
            {
              model: Building,
              as: 'building',
              attributes: ['id', 'siteId'],
              where: whereBuilding,
            },
          ],
        },
      ],
    });

    return { rows: rows.map(assetToDTO), count };
  }
}
