import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateSiteDto } from '../dto/create-site.dto';
import { Site } from '../models/site.model';
import { Building } from '../models/buildings.model';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site) private readonly siteModel: typeof Site,
    @InjectModel(Building) private readonly buildingModel: typeof Building,
  ) {}

  findAll(companyId?: string) {
    return this.siteModel.findAll({
      where: companyId ? ({ companyId } as any) : undefined,
      order: [['id', 'ASC']],
    });
  }

  async findOneWithBuildings(id: string) {
    const site = await this.siteModel.findByPk(id);
    if (!site) throw new NotFoundException('Site not found');
    const buildings = await this.buildingModel.findAll({
      where: { siteId: id } as any,
      order: [['code', 'ASC']],
    });
    return { site, buildings };
  }

  create(dto: CreateSiteDto) {
    return this.siteModel.create(dto as any);
  }

  async remove(id: string) {
    const site = await this.siteModel.findByPk(id);
    if (!site) throw new NotFoundException('Site not found');
    await site.destroy();
    return { deleted: true };
  }
}
