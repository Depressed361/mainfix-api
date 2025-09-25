import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateLocationDto } from '../dto/create-location.dto';
import { Location } from '../models/location.model';

@Injectable()
export class LocationsService {
  constructor(@InjectModel(Location) private readonly model: typeof Location) {}

  create(dto: CreateLocationDto) {
    return this.model.create(dto as any);
  }

  async findOne(id: string, buildingId?: string) {
    const location = await this.model.findByPk(id);
    if (!location) throw new NotFoundException('Location not found');
    if (buildingId && location.buildingId !== buildingId) {
      throw new NotFoundException('Location not found');
    }
    return location;
  }

  async remove(id: string, buildingId?: string) {
    const location = await this.findOne(id, buildingId);
    await location.destroy();
    return { deleted: true };
  }
}
