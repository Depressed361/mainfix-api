import { BuildingGuard, LocationDTO } from '../domain/ports';
import { Building } from '../../models/buildings.model';

export class SequelizeBuildingGuard implements BuildingGuard {
  async ensureBuildingExists(buildingId: string): Promise<void> {
    const building = await Building.findByPk(buildingId);
    if (!building) throw new Error('BUILDING_NOT_FOUND');
  }

  ensureLocationBelongsToBuilding(loc: LocationDTO, buildingId?: string): void {
    if (
      buildingId &&
      loc &&
      typeof loc === 'object' &&
      'buildingId' in loc &&
      loc.buildingId !== buildingId
    ) {
      throw new Error('LOCATION_NOT_IN_BUILDING');
    }
  }

  async ensureBuildingBelongsToSite(
    buildingId: string,
    siteId: string,
  ): Promise<void> {
    const building = await Building.findByPk(buildingId);
    if (!building) throw new Error('BUILDING_NOT_FOUND');
    if (building.siteId !== siteId) throw new Error('BUILDING_NOT_IN_SITE');
  }
}
