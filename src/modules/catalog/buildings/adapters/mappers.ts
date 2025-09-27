import type { BuildingDTO } from '../domain/ports';
import type { Building } from '../../models/buildings.model';

export const buildingToDTO = (row: Building): BuildingDTO => ({
  id: row.getDataValue('id'),
  name: row.getDataValue('name'),
  siteId: row.getDataValue('siteId'),
  code: row.getDataValue('code'),
});

export const fromCreate = (input: Omit<BuildingDTO, 'id'>) => ({
  name: input.name,
  siteId: input.siteId,
  code: input.code,
});
