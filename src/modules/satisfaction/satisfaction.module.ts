import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SatisfactionSurvey } from './models/satisfaction-survey.model';
import { SurveysController } from './controllers/surveys.controller';
import { SurveysService } from './services/surveys.service';

@Module({
  imports: [SequelizeModule.forFeature([SatisfactionSurvey])],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SequelizeModule],
})
export class SatisfactionModule {}

