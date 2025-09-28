// ...existing code...
import type { LocationDTO } from '../domain/ports';
import type { Location } from '../../models/location.model';

export const locationToDTO = (row: Location): LocationDTO => ({
  id: row.id,
  name: row.name,
  buildingId: row.buildingId ?? row.buildingId ?? null,

  description: row.description ?? null,
});

/**
 * Prépare les données pour la création : normalise/trim les champs
 * et force buildingId à string | null.
 */
export const fromCreate = (
  input: Omit<LocationDTO, 'id'>,
): Omit<LocationDTO, 'id'> => {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const buildingId =
    typeof input.buildingId === 'string'
      ? input.buildingId.trim() || null
      : typeof input.buildingId === 'number'
        ? String(input.buildingId)
        : null;
  const description =
    typeof input.description === 'string'
      ? input.description.trim() || null
      : null;

  return {
    name,
    buildingId: buildingId ?? '',
    description,
  };
};
// ...existing code...
