import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RseReport } from './models/rse-report.model';
import { SatisfactionSurvey } from '../satisfaction/models/satisfaction-survey.model';
import { Ticket } from '../tickets/models/ticket.model';
import { Category } from '../taxonomy/models/category.model';
import { Site } from '../catalog/models/site.model';
import { WellBeingScore } from '../well-being/models/well-being-score.model';
import { AdminScope } from '../directory/models/admin-scope.model';
import { RseReportsController } from './infra/rse-reports.controller';
import { TOKENS } from './domain/ports';
import { SequelizeRseReportRepository } from './adapters/rse-report.repository.sequelize';
import { SequelizeSatisfactionQuery, SequelizeComfortQuery, SequelizeTicketKpiQuery, SequelizeTaxonomyQuery, SequelizeCompanyBoundaryQuery } from './adapters/queries.sequelize';
import { LocalFileExporter } from './adapters/file-exporter.fs';
import { GenerateRseReport } from './domain/use-cases/GenerateRseReport';
import { ListRseReports } from './domain/use-cases/ListRseReports';
import { GetRseReport } from './domain/use-cases/GetRseReport';
import { ExportRseReport } from './domain/use-cases/ExportRseReport';
import { RebuildRangeRseReports } from './domain/use-cases/RebuildRangeRseReports';

@Module({
  imports: [SequelizeModule.forFeature([RseReport, SatisfactionSurvey, Ticket, Category, Site, WellBeingScore, AdminScope])],
  controllers: [RseReportsController],
  providers: [
    { provide: TOKENS.RseReportRepository, useClass: SequelizeRseReportRepository },
    { provide: TOKENS.SatisfactionQuery, useClass: SequelizeSatisfactionQuery },
    { provide: TOKENS.ComfortQuery, useClass: SequelizeComfortQuery },
    { provide: TOKENS.TicketKpiQuery, useClass: SequelizeTicketKpiQuery },
    { provide: TOKENS.TaxonomyQuery, useClass: SequelizeTaxonomyQuery },
    { provide: TOKENS.CompanyBoundaryQuery, useClass: SequelizeCompanyBoundaryQuery },
    { provide: TOKENS.FileExporter, useClass: LocalFileExporter },
    // Use-cases
    { provide: GenerateRseReport, useFactory: (repo, boundary, sat, comfort, kpi, tax) => new GenerateRseReport(repo, boundary, sat, comfort, kpi, tax), inject: [TOKENS.RseReportRepository, TOKENS.CompanyBoundaryQuery, TOKENS.SatisfactionQuery, TOKENS.ComfortQuery, TOKENS.TicketKpiQuery, TOKENS.TaxonomyQuery] },
    { provide: ListRseReports, useFactory: (repo) => new ListRseReports(repo), inject: [TOKENS.RseReportRepository] },
    { provide: GetRseReport, useFactory: (repo) => new GetRseReport(repo), inject: [TOKENS.RseReportRepository] },
    { provide: ExportRseReport, useFactory: (repo, exp) => new ExportRseReport(repo, exp), inject: [TOKENS.RseReportRepository, TOKENS.FileExporter] },
    { provide: RebuildRangeRseReports, useFactory: (gen) => new RebuildRangeRseReports(gen), inject: [GenerateRseReport] },
  ],
  exports: [SequelizeModule],
})
export class ReportsModule {}
