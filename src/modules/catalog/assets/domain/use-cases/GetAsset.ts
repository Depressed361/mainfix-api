import { AssetRepository, AssetDTO, AssetId } from '../ports';

export class GetAsset {
  constructor(private readonly repo: AssetRepository) {}

  async exec(id: AssetId): Promise<AssetDTO> {
    const asset = await this.repo.findById(id);
    if (!asset) throw new Error('ASSET_NOT_FOUND');
    return asset;
  }
}
