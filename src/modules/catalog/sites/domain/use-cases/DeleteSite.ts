import { SiteRepository } from '../ports';
import { SiteId } from '../types';

export class DeleteSite {
  constructor(private readonly repo: SiteRepository) {}

  async exec(id: SiteId): Promise<{ deleted: true }> {
    const normalizedId = id?.trim();
    if (!normalizedId) throw new Error('INVALID_SITE_ID');
    await this.repo.delete(normalizedId);
    return { deleted: true };
  }
}
