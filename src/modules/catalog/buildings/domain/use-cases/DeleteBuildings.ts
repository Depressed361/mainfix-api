import { BuildingRepository, BuildingId } from '../ports';

export class DeleteBuilding {
  constructor(private readonly repo: BuildingRepository) {}

  async exec(id: BuildingId): Promise<void> {
    const row = await this.repo.findById(id);
    if (!row) throw new Error('BUILDING_NOT_FOUND');
    await this.repo.delete(id);
  }
}
