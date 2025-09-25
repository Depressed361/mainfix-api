import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateComfortIndicatorDto } from '../dto/create-comfort-indicator.dto';
import { ComfortIndicator } from '../services/controllers/models/comfort-indicator.model';

@Injectable()
export class ComfortIndicatorsService {
  constructor(
    @InjectModel(ComfortIndicator)
    private readonly model: typeof ComfortIndicator,
  ) {}

  create(dto: CreateComfortIndicatorDto) {
    return this.model.create(dto as any);
  }

  findAll(locationId?: string) {
    return this.model.findAll({
      where: locationId ? ({ locationId } as any) : undefined,
      order: [['measured_at', 'DESC']],
    });
  }
}
