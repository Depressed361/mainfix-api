import { Op } from 'sequelize';
import { Building } from '../../../models/buildings.model';
import { Location } from '../../../models/location.model';
import { locationToDTO } from '../mappers';
import type { ListLocationsQuery, LocationDTO } from '../../domain/ports';

export const listLocationsBySite = async (
  siteId: string,
  query: ListLocationsQuery,
): Promise<{ rows: LocationDTO[]; count: number }> => {
  const limit = query.limit && query.limit > 0 ? query.limit : 20;
  const offset = query.offset && query.offset >= 0 ? query.offset : 0;
  const where: Record<string, unknown> = {};

  if (query.search) {
    where.name = { [Op.iLike]: `%${query.search}%` };
  }

  const { rows, count } = await Location.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']],
    include: [
      {
        model: Building,
        as: 'building',
        where: { siteId },
        attributes: ['id', 'siteId'],
      },
    ],
  });

  return { rows: rows.map(locationToDTO), count };
};
