import { Op } from 'sequelize';
import {
  BuildingRepository,
  BuildingDTO,
  ListBuildingsQuery,
  ListBuildingsResult,
} from '../domain/ports';
import { Building } from '../../models/buildings.model';
import { buildingToDTO, fromCreate } from './mappers';

export class SequelizeBuildingRepository implements BuildingRepository {
  async create(input: Omit<BuildingDTO, 'id'>): Promise<BuildingDTO> {
    const row = await Building.create(fromCreate(input) as any);
    return buildingToDTO(row);
  }

  async findById(id: string): Promise<BuildingDTO | null> {
    const row = await Building.findByPk(id);
    return row ? buildingToDTO(row) : null;
  }

  async list(q: ListBuildingsQuery): Promise<ListBuildingsResult> {
    const where: Record<string, unknown> = {};
    if (q.siteId) where.siteId = q.siteId;
    if (q.search) where.name = { [Op.iLike]: `%${q.search}%` };
    const limit = q.limit && q.limit > 0 ? q.limit : 20;
    const offset = q.offset && q.offset >= 0 ? q.offset : 0;

    const { rows, count } = await Building.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
    });
    return { rows: rows.map((row) => buildingToDTO(row)), count };
  }

  async update(
    id: string,
    patch: Partial<Omit<BuildingDTO, 'id'>>,
  ): Promise<BuildingDTO> {
    const row = await Building.findByPk(id);
    if (!row) throw new Error('BUILDING_NOT_FOUND');
    await row.update(patch);
    return buildingToDTO(row);
  }

  async delete(id: string): Promise<void> {
    await Building.destroy({ where: { id } });
  }
}
