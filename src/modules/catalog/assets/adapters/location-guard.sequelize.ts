import { LocationGuard } from '../domain/ports';
import { Location } from '../../models/location.model';

export class SequelizeLocationGuard implements LocationGuard {
  async ensureLocationExists(locationId: string): Promise<void> {
    const loc = await Location.findByPk(locationId);
    if (!loc) throw new Error('LOCATION_NOT_FOUND');
  }
}
