import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SatisfactionSurvey } from './models/satisfaction-survey.model';
import { SurveysControllerV2 } from './infra/surveys.controller';
import { TOKENS } from './domain/ports';
import { SequelizeSatisfactionSurveyRepository } from './adapters/survey.repository.sequelize';
import { SequelizeTicketsQuery, SequelizeDirectoryQuery } from './adapters/queries.sequelize';
import { SubmitSurvey } from './domain/use-cases/SubmitSurvey';
import { ListSurveys } from './domain/use-cases/ListSurveys';
import { GetAverages } from './domain/use-cases/GetAverages';
import { Ticket } from '../tickets/models/ticket.model';
import { User } from '../directory/models/user.model';
import { AuthModule } from '../auth/auth.module';
import { AdminScopeGuardAdapter } from './adapters/admin-scope-guard.adapter';

@Module({
  imports: [SequelizeModule.forFeature([SatisfactionSurvey, Ticket, User]), AuthModule],
  controllers: [SurveysControllerV2],
  providers: [
    { provide: TOKENS.SatisfactionSurveyRepository, useClass: SequelizeSatisfactionSurveyRepository },
    { provide: TOKENS.TicketsQuery, useClass: SequelizeTicketsQuery },
    { provide: TOKENS.DirectoryQuery, useClass: SequelizeDirectoryQuery },
    { provide: TOKENS.AdminScopeGuard, useClass: AdminScopeGuardAdapter },
    { provide: SubmitSurvey, useFactory: (repo, tickets, dir) => new SubmitSurvey(repo, tickets, dir), inject: [TOKENS.SatisfactionSurveyRepository, TOKENS.TicketsQuery, TOKENS.DirectoryQuery] },
    { provide: ListSurveys, useFactory: (repo, guard) => new ListSurveys(repo, guard), inject: [TOKENS.SatisfactionSurveyRepository, TOKENS.AdminScopeGuard] },
    { provide: GetAverages, useFactory: (repo) => new GetAverages(repo), inject: [TOKENS.SatisfactionSurveyRepository] },
  ],
  exports: [SequelizeModule, TOKENS.SatisfactionSurveyRepository],
})
export class SatisfactionModule {}
