import { SiteRepository } from '../ports';
import { SiteId, SiteWithBuildings } from '../types';

export class GetSite {
  constructor(private readonly repo: SiteRepository) {}

  async exec(id: SiteId): Promise<SiteWithBuildings> {
    const normalizedId = id?.trim();
    if (!normalizedId) throw new Error('INVALID_SITE_ID');

    const result = await this.repo.findWithBuildings(normalizedId);
    if (!result) throw new Error('SITE_NOT_FOUND');

    return result;
  }
}
