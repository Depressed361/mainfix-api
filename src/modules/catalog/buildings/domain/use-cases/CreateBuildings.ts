import { BuildingRepository, BuildingDTO, SiteGuard } from '../ports';

export class CreateBuilding {
  constructor(
    private readonly repo: BuildingRepository,
    private readonly guard: SiteGuard,
  ) {}

  async exec(input: Omit<BuildingDTO, 'id'>): Promise<BuildingDTO> {
    if (!input.name?.trim()) throw new Error('INVALID_NAME');
    if (!input.siteId) throw new Error('INVALID_SITE_ID');
    if (!input.code?.trim()) throw new Error('INVALID_CODE');

    await this.guard.ensureSiteExists(input.siteId);
    return this.repo.create({
      name: input.name.trim(),
      siteId: input.siteId,
      code: input.code.trim(),
    });
  }
}
