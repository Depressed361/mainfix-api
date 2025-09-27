import { BuildingGuard, LocationDTO, LocationRepository } from '../ports';

export class CreateLocation {
  constructor(
    private readonly repo: LocationRepository,
    private readonly guard: BuildingGuard,
  ) {}

  async exec(input: Omit<LocationDTO, 'id'>): Promise<LocationDTO> {
    if (!input.name?.trim()) throw new Error('INVALID_NAME');
    if (!input.buildingId) throw new Error('INVALID_BUILDING_ID');

    await this.guard.ensureBuildingExists(input.buildingId);
    return this.repo.create({
      name: input.name.trim(),
      buildingId: input.buildingId,
      description: input.description?.trim() || null,
    });
  }
}
