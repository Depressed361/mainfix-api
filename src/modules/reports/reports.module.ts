import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from '../tickets/models/ticket.model';
import { SatisfactionSurvey } from '../satisfaction/models/satisfaction-survey.model';
import { RseReportsController } from './rse-reports.controller';
import { RseReportsService } from './rse-reports.service';

@Module({
  imports: [SequelizeModule.forFeature([Ticket, SatisfactionSurvey])],
  controllers: [RseReportsController],
  providers: [RseReportsService],
})
export class ReportsModule {}

