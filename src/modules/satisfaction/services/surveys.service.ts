import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateSurveyDto } from '../dto/create-survey.dto';
import { SatisfactionSurvey } from '../models/satisfaction-survey.model';

@Injectable()
export class SurveysService {
  constructor(
    @InjectModel(SatisfactionSurvey)
    private readonly model: typeof SatisfactionSurvey,
  ) {}

  create(ticketId: string, dto: CreateSurveyDto) {
    return this.model.create({ ...(dto as any), ticketId } as any);
  }

  findAll(ticketId: string) {
    return this.model.findAll({ where: { ticketId } as any, order: [['created_at', 'ASC']] });
  }
}
