import {
  AssetRepository,
  AssetDTO,
  AssetId,
  LocationGuard,
  UniqueCodeGuard,
} from '../ports';

export class UpdateAsset {
  constructor(
    private readonly repo: AssetRepository,
    private readonly locGuard: LocationGuard,
    private readonly uniqGuard: UniqueCodeGuard,
  ) {}

  async exec(
    id: AssetId,
    patch: Partial<Omit<AssetDTO, 'id'>>,
  ): Promise<AssetDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error('ASSET_NOT_FOUND');

    if (patch.companyId && patch.companyId !== existing.companyId) {
      throw new Error('COMPANY_CHANGE_FORBIDDEN');
    }

    if (patch.code !== undefined) {
      if (!patch.code?.trim()) throw new Error('INVALID_CODE');
      await this.uniqGuard.ensureCompanyCodeIsUnique(
        existing.companyId,
        patch.code,
        id,
      );
    }

    if (patch.locationId !== undefined && patch.locationId) {
      await this.locGuard.ensureLocationExists(patch.locationId);
    }

    return this.repo.update(id, {
      ...patch,
      code: patch.code?.trim() ?? patch.code,
      kind: patch.kind?.trim() ?? patch.kind,
    });
  }
}
