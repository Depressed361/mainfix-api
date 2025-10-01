import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { UpsertSiteScore } from '../domain/use-cases/UpsertSiteScore';
import { ListSiteScores } from '../domain/use-cases/ListSiteScores';
import { GetSiteScore } from '../domain/use-cases/GetSiteScore';
import { ExportSiteScores } from '../domain/use-cases/ExportSiteScores';
import { ImportSiteScores } from '../domain/use-cases/ImportSiteScores';
import { RebuildRangeForCompany } from '../domain/use-cases/RebuildRangeForCompany';
import { GetCompanyAverage } from '../domain/use-cases/GetCompanyAverage';
import { ListSiteScoresQueryDto, RebuildRangeDto, UpsertSiteScoreDto } from './dto';

@Controller('well-being')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class WellBeingController {
  constructor(
    private readonly upsert: UpsertSiteScore,
    private readonly list: ListSiteScores,
    private readonly getOne: GetSiteScore,
    private readonly exporter: ExportSiteScores,
    private readonly importer: ImportSiteScores,
    private readonly rebuild: RebuildRangeForCompany,
    private readonly companyAvg: GetCompanyAverage,
  ) {}

  @Post('upsert')
  @HttpCode(HttpStatus.CREATED)
  upsertScore(@Body() dto: UpsertSiteScoreDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.upsert.execute(actor.id, { siteId: dto.siteId, periodStart: new Date(dto.periodStart), periodEnd: new Date(dto.periodEnd) });
  }

  @Post('rebuild')
  rebuildCompany(@Body() dto: RebuildRangeDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.rebuild.execute(actor.id, { companyId: dto.companyId, periodStart: new Date(dto.periodStart), periodEnd: new Date(dto.periodEnd), granularity: dto.granularity });
  }

  @Get('scores')
  listScores(@Query() q: ListSiteScoresQueryDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.list.execute(actor.id, { siteIds: q.siteIds, from: q.from ? new Date(q.from) : undefined, to: q.to ? new Date(q.to) : undefined, page: q.page, pageSize: q.pageSize });
  }

  @Get('company-average')
  getCompanyAverage(@Query('companyId') companyId: string, @Query('periodStart') ps: string, @Query('periodEnd') pe: string, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.companyAvg.execute(actor.id, { companyId, periodStart: new Date(ps), periodEnd: new Date(pe) });
  }
}

