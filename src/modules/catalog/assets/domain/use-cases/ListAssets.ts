import { AssetRepository, ListAssetsQuery } from '../ports';
import type { ListAssetsResult } from '../types';

export class ListAssets {
  constructor(private readonly repo: AssetRepository) {}

  async exec(query: ListAssetsQuery = {}): Promise<ListAssetsResult> {
    const sanitized: ListAssetsQuery = {};

    const companyId = query.companyId?.trim();
    if (companyId) sanitized.companyId = companyId;

    const locationId = query.locationId?.trim();
    if (locationId) sanitized.locationId = locationId;

    const buildingId = query.buildingId?.trim();
    if (buildingId) sanitized.buildingId = buildingId;

    const siteId = query.siteId?.trim();
    if (siteId) sanitized.siteId = siteId;

    const search = query.search?.trim();
    if (search) sanitized.search = search;

    if (
      typeof query.limit === 'number' &&
      Number.isFinite(query.limit) &&
      query.limit > 0
    ) {
      sanitized.limit = Math.min(query.limit, 100);
    }

    if (
      typeof query.offset === 'number' &&
      Number.isFinite(query.offset) &&
      query.offset >= 0
    ) {
      sanitized.offset = query.offset;
    }

    return this.repo.list(sanitized);
  }
}
