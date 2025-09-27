import { SiteRepository } from '../ports';
import { SiteDTO } from '../types';

export class CreateSite {
  constructor(private readonly repo: SiteRepository) {}

  async exec(input: Omit<SiteDTO, 'id'>): Promise<SiteDTO> {
    if (!input.companyId) throw new Error('INVALID_COMPANY_ID');
    if (!input.code?.trim()) throw new Error('INVALID_CODE');
    if (!input.name?.trim()) throw new Error('INVALID_NAME');

    const payload: Omit<SiteDTO, 'id'> = {
      companyId: input.companyId,
      code: input.code.trim(),
      name: input.name.trim(),
      timezone: input.timezone?.trim() || 'Europe/Paris',
    };

    return this.repo.create(payload);
  }
}
