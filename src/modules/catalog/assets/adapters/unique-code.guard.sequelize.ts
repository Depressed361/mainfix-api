import { Op } from 'sequelize';
import type { UniqueCodeGuard } from '../domain/ports';
import { Asset } from '../../models/asset.model';

export class SequelizeUniqueCodeGuard implements UniqueCodeGuard {
  async ensureCompanyCodeIsUnique(
    companyId: string,
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const where: {
      companyId: string;
      code: string;
      id?: { [Op.ne]: string };
    } = { companyId, code };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const existing = await Asset.findOne({ where, attributes: ['id'] });
    if (existing) throw new Error('ASSET_CODE_ALREADY_EXISTS');
  }
}
