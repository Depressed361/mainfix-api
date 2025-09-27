import type { Site } from '../../models/site.model';
import type { Building } from '../../models/buildings.model';
import { SiteDTO, BuildingDTO } from '../domain/types';

export const toDTO = (row: Site): SiteDTO => ({
  id: row.getDataValue('id'),
  companyId: row.getDataValue('companyId'),
  code: row.getDataValue('code'),
  name: row.getDataValue('name'),
  timezone: row.getDataValue('timezone'),
});

export const toBuildingDTO = (row: Building): BuildingDTO => ({
  id: row.getDataValue('id'),
  siteId: row.getDataValue('siteId'),
  code: row.getDataValue('code'),
  name: row.getDataValue('name'),
});

export const fromCreate = (input: Omit<SiteDTO, 'id'>) => ({
  companyId: input.companyId,
  code: input.code,
  name: input.name,
  timezone: input.timezone,
});
