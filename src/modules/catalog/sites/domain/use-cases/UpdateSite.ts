import { SiteRepository } from '../ports';
import { SiteDTO, SiteId } from '../types';

export class UpdateSite {
  constructor(private readonly repo: SiteRepository) {}

  async exec(
    id: SiteId,
    patch: Partial<Omit<SiteDTO, 'id'>>,
  ): Promise<SiteDTO> {
    const normalizedId = id?.trim();
    if (!normalizedId) throw new Error('INVALID_SITE_ID');
    if (!patch || Object.keys(patch).length === 0)
      throw new Error('INVALID_PATCH');

    const sanitized: Partial<Omit<SiteDTO, 'id'>> = {};

    if (patch.companyId !== undefined) {
      if (!patch.companyId) throw new Error('INVALID_COMPANY_ID');
      sanitized.companyId = patch.companyId;
    }

    if (patch.code !== undefined) {
      if (!patch.code?.trim()) throw new Error('INVALID_CODE');
      sanitized.code = patch.code.trim();
    }

    if (patch.name !== undefined) {
      if (!patch.name?.trim()) throw new Error('INVALID_NAME');
      sanitized.name = patch.name.trim();
    }

    if (patch.timezone !== undefined) {
      if (!patch.timezone?.trim()) throw new Error('INVALID_TIMEZONE');
      sanitized.timezone = patch.timezone.trim();
    }

    if (Object.keys(sanitized).length === 0) throw new Error('INVALID_PATCH');

    return this.repo.update(normalizedId, sanitized);
  }
}
