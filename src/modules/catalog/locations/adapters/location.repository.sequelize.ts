import { Op } from 'sequelize';
import {
  LocationRepository,
  LocationDTO,
  ListLocationsQuery,
} from '../domain/ports';
import { Location } from '../../models/location.model';
import { locationToDTO, fromCreate } from './mappers';
import { listLocationsBySite } from './read-models/location-list.readmodel.sequelize';

export class SequelizeLocationRepository implements LocationRepository {
  async create(input: Omit<LocationDTO, 'id'>): Promise<LocationDTO> {
    const row = await Location.create(fromCreate(input) as any);
    return locationToDTO(row);
  }

  async findById(id: string): Promise<LocationDTO | null> {
    const row = await Location.findByPk(id);
    return row ? locationToDTO(row) : null;
  }

  async list(
    q: ListLocationsQuery,
  ): Promise<{ rows: LocationDTO[]; count: number }> {
    if (q.siteId && !q.buildingId) {
      return listLocationsBySite(q.siteId, q);
    }

    const where: Record<string, unknown> = {};

    if (q.buildingId) {
      where.buildingId = q.buildingId;
    }

    if (q.search) {
      where.name = { [Op.iLike]: `%${q.search}%` };
    }

    const limit = q.limit && q.limit > 0 ? q.limit : 20;
    const offset = q.offset && q.offset >= 0 ? q.offset : 0;

    const { rows, count } = await Location.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    return { rows: rows.map(locationToDTO), count };
  }

  async update(
    id: string,
    patch: Partial<Omit<LocationDTO, 'id'>>,
  ): Promise<LocationDTO> {
    const row = await Location.findByPk(id);
    if (!row) throw new Error('LOCATION_NOT_FOUND');
    await row.update(patch);
    return locationToDTO(row);
  }

  async delete(id: string): Promise<void> {
    await Location.destroy({ where: { id } });
  }
}
