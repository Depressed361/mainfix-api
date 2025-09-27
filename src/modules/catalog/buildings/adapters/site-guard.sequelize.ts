import { SiteGuard, BuildingDTO } from '../domain/ports';
import { Site } from '../../models/site.model';

export class SequelizeSiteGuard implements SiteGuard {
  async ensureSiteExists(siteId: string): Promise<void> {
    const site = await Site.findByPk(siteId);
    if (!site) throw new Error('SITE_NOT_FOUND');
  }

  ensureBuildingBelongsToSite(building: BuildingDTO, siteId?: string): void {
    if (siteId && building.siteId !== siteId) {
      throw new Error('BUILDING_NOT_IN_SITE');
    }
  }
}
