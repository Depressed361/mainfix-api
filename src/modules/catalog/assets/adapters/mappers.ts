import type { AssetDTO } from '../domain/ports';
import type { Asset } from '../../models/asset.model';

export const assetToDTO = (row: Asset): AssetDTO => ({
  id: row.id,
  companyId: row.companyId,
  code: row.code,
  locationId: row.locationId ?? null,
  kind: row.kind ?? null,
  metadata: (row.metadata as Record<string, unknown> | null) ?? null,
});

export const fromCreate = (
  input: Omit<AssetDTO, 'id'>,
): Omit<AssetDTO, 'id'> => ({
  companyId: input.companyId,
  code: input.code,
  locationId: input.locationId ?? null,
  kind: input.kind ?? null,
  metadata: input.metadata ?? null,
});
