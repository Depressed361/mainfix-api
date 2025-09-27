import { LocationId, LocationRepository } from '../ports';

export class DeleteLocation {
  constructor(private readonly repo: LocationRepository) {}

  async exec(id: LocationId): Promise<void> {
    const row = await this.repo.findById(id);
    if (!row) throw new Error('LOCATION_NOT_FOUND');
    await this.repo.delete(id);
  }
}
