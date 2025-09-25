import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WellBeingScore } from '../models/well-being-score.model';

@Injectable()
export class WellBeingService {
  constructor(
    @InjectModel(WellBeingScore)
    private readonly model: typeof WellBeingScore,
  ) {}

  findAll(siteId?: string) {
    return this.model.findAll({
      where: siteId ? ({ siteId } as any) : undefined,
      order: [['period_start', 'DESC']],
    });
  }
}

