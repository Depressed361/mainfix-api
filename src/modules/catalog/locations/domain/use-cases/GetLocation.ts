import { LocationId, LocationRepository, LocationDTO } from '../ports';

export class GetLocation {
  constructor(private readonly repo: LocationRepository) {}

  async exec(id: LocationId): Promise<LocationDTO> {
    const row = await this.repo.findById(id);
    if (!row) throw new Error('LOCATION_NOT_FOUND');
    return row;
  }
}
