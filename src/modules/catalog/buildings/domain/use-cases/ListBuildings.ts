import { BuildingRepository, ListBuildingsQuery } from '../ports';

export class ListBuildings {
  constructor(private readonly repo: BuildingRepository) {}

  async exec(query: ListBuildingsQuery = {}) {
    const sanitized: ListBuildingsQuery = {};

    const siteId = query.siteId?.trim();
    if (siteId) sanitized.siteId = siteId;

    if (query.search?.trim()) sanitized.search = query.search.trim();

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
