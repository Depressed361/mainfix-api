import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateBuildingDto } from '../dto/create-building.dto';
import { Building } from '../models/buildings.model';

@Injectable()
export class BuildingsService {
  constructor(@InjectModel(Building) private readonly model: typeof Building) {}

  create(dto: CreateBuildingDto) {
    return this.model.create(dto as any);
  }

  async findOne(id: string) {
    const b = await this.model.findByPk(id);
    if (!b) throw new NotFoundException('Building not found');
    return b;
  }

  async remove(id: string) {
    const b = await this.findOne(id);
    await b.destroy();
    return { deleted: true };
  }
}
