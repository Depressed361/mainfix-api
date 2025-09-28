import { Op } from 'sequelize';
import type {
  AssetRepository,
  AssetDTO,
  ListAssetsQuery,
} from '../domain/ports';
import { Asset } from '../../models/asset.model';
import { assetToDTO, fromCreate } from './mappers';
import { SequelizeAssetListReadModel } from './read-models/asset-list.readmodel.sequelize';

export class SequelizeAssetRepository implements AssetRepository {
  constructor(
    private readonly listReadModel = new SequelizeAssetListReadModel(),
  ) {}

  private warnAnyCast(label: string, value: unknown) {
    // log utile en dev/test pour repérer les casts "as any"
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[WARN] ${label} - performing 'any' cast`, {
        preview:
          typeof value === 'object' && value !== null
            ? Object.keys(value as any).slice(0, 10)
            : typeof value,
      });
    }
  }

  async create(input: Omit<AssetDTO, 'id'>): Promise<AssetDTO> {
    const payload = fromCreate(input);
    this.warnAnyCast('Asset.create payload', payload);
    const row = await Asset.create(payload as any);
    return assetToDTO(row);
  }

  async findById(id: string): Promise<AssetDTO | null> {
    const row = await Asset.findByPk(id);
    return row ? assetToDTO(row) : null;
  }

  async list(q: ListAssetsQuery): Promise<{ rows: AssetDTO[]; count: number }> {
    if ((q.siteId || q.buildingId) && !q.locationId) {
      return this.listReadModel.list(q);
    }

    const where: { [key: string]: unknown; [Op.or]?: unknown } = {};
    if (q.companyId) where.companyId = q.companyId;
    if (q.locationId) where.locationId = q.locationId;
    if (q.search) {
      where[Op.or] = [
        { code: { [Op.iLike]: `%${q.search}%` } },
        { kind: { [Op.iLike]: `%${q.search}%` } },
      ];
    }

    const limit = q.limit && q.limit > 0 ? q.limit : 20;
    const offset = q.offset && q.offset >= 0 ? q.offset : 0;

    const { rows, count } = await Asset.findAndCountAll({
      where,
      limit,
      offset,
      order: [['code', 'ASC']],
    });
    return { rows: rows.map(assetToDTO), count };
  }

  async update(
    id: string,
    patch: Partial<Omit<AssetDTO, 'id'>>,
  ): Promise<AssetDTO> {
    const row = await Asset.findByPk(id);
    if (!row) throw new Error('ASSET_NOT_FOUND');

    this.warnAnyCast('Asset.update patch', patch);
    await row.update(patch as any);
    return assetToDTO(row);
  }

  async delete(id: string): Promise<void> {
    await Asset.destroy({ where: { id } });
  }
}
