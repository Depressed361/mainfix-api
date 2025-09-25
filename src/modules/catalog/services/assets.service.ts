import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { Asset } from '../models/asset.model';

@Injectable()
export class AssetsService {
  constructor(@InjectModel(Asset) private readonly model: typeof Asset) {}

  create(dto: CreateAssetDto) {
    return this.model.create(dto as any);
  }

  async findOne(id: string, companyId?: string) {
    const asset = await this.model.findByPk(id);
    if (!asset) throw new NotFoundException('Asset not found');
    if (companyId && asset.companyId !== companyId) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async remove(id: string, companyId?: string) {
    const asset = await this.findOne(id, companyId);
    await asset.destroy();
    return { deleted: true };
  }
}
