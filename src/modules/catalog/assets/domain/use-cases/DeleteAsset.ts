import { AssetRepository, AssetId } from '../ports';

export class DeleteAsset {
  constructor(private readonly repo: AssetRepository) {}

  async exec(id: AssetId): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error('ASSET_NOT_FOUND');
    await this.repo.delete(id);
  }
}
