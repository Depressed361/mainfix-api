import { BuildingRepository, BuildingDTO, BuildingId } from '../ports';

export class GetBuilding {
  constructor(private readonly repo: BuildingRepository) {}

  async exec(id: BuildingId): Promise<BuildingDTO> {
    const row = await this.repo.findById(id);
    if (!row) throw new Error('BUILDING_NOT_FOUND');
    return row;
  }
}
