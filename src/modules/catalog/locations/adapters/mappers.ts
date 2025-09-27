import type { LocationDTO } from '../domain/ports';
import type { Location } from '../../models/location.model';

export const locationToDTO = (row: Location): LocationDTO => ({
  id: row.id,
  name: row.name,
  buildingId: row.buildingId,
  description: row.description ?? null,
});

export const fromCreate = (input: Omit<LocationDTO, 'id'>) => ({
  name: typeof input.name === 'string' ? input.name : '',
  buildingId:
    typeof input.buildingId === 'string' || typeof input.buildingId === 'number'
      ? input.buildingId
      : '',
  description: typeof input.description === 'string' ? input.description : null,
});
