import type { AssetDTO, ListAssetsQuery } from './ports';

export type { AssetDTO, ListAssetsQuery };

export interface ListAssetsResult {
  rows: AssetDTO[];
  count: number;
}
