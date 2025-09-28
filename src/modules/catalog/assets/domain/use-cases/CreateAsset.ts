import {
  AssetRepository,
  AssetDTO,
  LocationGuard,
  UniqueCodeGuard,
} from '../ports';

export class CreateAsset {
  constructor(
    private readonly repo: AssetRepository,
    private readonly locGuard: LocationGuard,
    private readonly uniqGuard: UniqueCodeGuard,
  ) {}
  companyId: string;
  code: string;
  locationId?: string | null;
  kind?: string | null;
  metadata?: Record<string, any> | null;

  async exec(input: Omit<AssetDTO, 'id'>): Promise<AssetDTO> {
    if (!input.companyId) throw new Error('INVALID_COMPANY_ID');
    if (!input.code?.trim()) throw new Error('INVALID_CODE');

    if (input.locationId)
      await this.locGuard.ensureLocationExists(input.locationId);

    await this.uniqGuard.ensureCompanyCodeIsUnique(input.companyId, input.code);

    return this.repo.create({
      companyId: input.companyId,
      code: input.code.trim(),
      locationId: input.locationId?.trim() || null,
      kind: input.kind?.trim() || null,
      metadata: input.metadata || null,
    });
  }
}
