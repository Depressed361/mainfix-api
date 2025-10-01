import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WellBeingScore } from './models/well-being-score.model';
import { WellBeingController } from './infra/well-being.controller';
import { TOKENS } from './domain/ports';
import { SequelizeWellBeingScoreRepository } from './adapters/well-being-score.repository.sequelize';
import { SequelizeCatalogQuery, SequelizeSurveysQuery } from './adapters/queries.sequelize';
import { LocalCsvExporter, LocalCsvImporter } from './adapters/file-io.local';
import { UpsertSiteScore } from './domain/use-cases/UpsertSiteScore';
import { ListSiteScores } from './domain/use-cases/ListSiteScores';
import { GetSiteScore } from './domain/use-cases/GetSiteScore';
import { ExportSiteScores } from './domain/use-cases/ExportSiteScores';
import { ImportSiteScores } from './domain/use-cases/ImportSiteScores';
import { RebuildRangeForCompany } from './domain/use-cases/RebuildRangeForCompany';
import { GetCompanyAverage } from './domain/use-cases/GetCompanyAverage';
import { Site } from '../catalog/models/site.model';
import { SatisfactionSurvey } from '../satisfaction/models/satisfaction-survey.model';
import { Ticket } from '../tickets/models/ticket.model';

@Module({
  imports: [SequelizeModule.forFeature([WellBeingScore, Site, SatisfactionSurvey, Ticket])],
  controllers: [WellBeingController],
  providers: [
    { provide: TOKENS.WellBeingScoreRepository, useClass: SequelizeWellBeingScoreRepository },
    { provide: TOKENS.CatalogQuery, useClass: SequelizeCatalogQuery },
    { provide: TOKENS.SurveysQuery, useClass: SequelizeSurveysQuery },
    { provide: TOKENS.FileExporter, useClass: LocalCsvExporter },
    { provide: TOKENS.FileImporter, useClass: LocalCsvImporter },
    { provide: TOKENS.AdminScopeGuard, useValue: { canAccessSite: async () => true, canAccessCompany: async () => true } },
    { provide: UpsertSiteScore, useFactory: (r, s, c, g) => new UpsertSiteScore(r, s, c, g), inject: [TOKENS.WellBeingScoreRepository, TOKENS.SurveysQuery, TOKENS.CatalogQuery, TOKENS.AdminScopeGuard] },
    { provide: ListSiteScores, useFactory: (r, g) => new ListSiteScores(r, g), inject: [TOKENS.WellBeingScoreRepository, TOKENS.AdminScopeGuard] },
    { provide: GetSiteScore, useFactory: (r, g) => new GetSiteScore(r, g), inject: [TOKENS.WellBeingScoreRepository, TOKENS.AdminScopeGuard] },
    { provide: ExportSiteScores, useFactory: (r, e, g) => new ExportSiteScores(r, e, g), inject: [TOKENS.WellBeingScoreRepository, TOKENS.FileExporter, TOKENS.AdminScopeGuard] },
    { provide: ImportSiteScores, useFactory: (r, i, g) => new ImportSiteScores(r, i, g), inject: [TOKENS.WellBeingScoreRepository, TOKENS.FileImporter, TOKENS.AdminScopeGuard] },
    { provide: RebuildRangeForCompany, useFactory: (r, s, c, g) => new RebuildRangeForCompany(r, s, c, g), inject: [TOKENS.WellBeingScoreRepository, TOKENS.SurveysQuery, TOKENS.CatalogQuery, TOKENS.AdminScopeGuard] },
    { provide: GetCompanyAverage, useFactory: (r, c, g) => new GetCompanyAverage(r, c, g), inject: [TOKENS.WellBeingScoreRepository, TOKENS.CatalogQuery, TOKENS.AdminScopeGuard] },
  ],
  exports: [SequelizeModule, TOKENS.WellBeingScoreRepository],
})
export class WellBeingModule {}
