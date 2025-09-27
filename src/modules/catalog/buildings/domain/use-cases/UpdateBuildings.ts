import {
  BuildingRepository,
  BuildingDTO,
  SiteGuard,
  BuildingId,
} from '../ports';

export class UpdateBuilding {
  constructor(
    private readonly repo: BuildingRepository,
    private readonly guard: SiteGuard,
  ) {}

  async exec(
    id: BuildingId,
    patch: Partial<Omit<BuildingDTO, 'id'>>,
  ): Promise<BuildingDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error('BUILDING_NOT_FOUND');

    if (patch.siteId && patch.siteId !== existing.siteId) {
      throw new Error('SITE_CHANGE_FORBIDDEN');
    }

    this.guard.ensureBuildingBelongsToSite(existing, patch.siteId);

    if (patch.name && !patch.name.trim()) throw new Error('INVALID_NAME');
    if (patch.code && !patch.code.trim()) throw new Error('INVALID_CODE');

    return this.repo.update(id, {
      ...patch,
      name: patch.name?.trim() ?? patch.name,
      code: patch.code?.trim() ?? patch.code,
    });
  }
}
