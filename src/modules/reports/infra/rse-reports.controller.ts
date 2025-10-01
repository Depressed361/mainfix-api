import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { GenerateRseReport } from '../domain/use-cases/GenerateRseReport';
import { ListRseReports } from '../domain/use-cases/ListRseReports';
import { GetRseReport } from '../domain/use-cases/GetRseReport';
import { ExportRseReport } from '../domain/use-cases/ExportRseReport';
import { RebuildRangeRseReports } from '../domain/use-cases/RebuildRangeRseReports';
import { ExportRseReportDto, GenerateRseReportDto, ListRseReportsQueryDto } from './dto';

@Controller('reports/rse')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, CompanyScopeGuard)
export class RseReportsController {
  constructor(
    private readonly generate: GenerateRseReport,
    private readonly list: ListRseReports,
    private readonly get: GetRseReport,
    private readonly exportUc: ExportRseReport,
    private readonly rebuild: RebuildRangeRseReports,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  generateOne(@Body() dto: GenerateRseReportDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.generate.execute(actor, { companyId: dto.companyId, periodStart: new Date(dto.periodStart), periodEnd: new Date(dto.periodEnd) });
  }

  @Post('rebuild')
  rebuildRange(@Body() dto: GenerateRseReportDto & { range?: 'month'|'quarter'|'year' }, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.rebuild.execute(actor, { companyId: dto.companyId, periodStart: new Date(dto.periodStart), periodEnd: new Date(dto.periodEnd), range: (dto as any).range });
  }

  @Get()
  listReports(@Query() q: ListRseReportsQueryDto) {
    return this.list.execute(q.companyId, { from: q.from ? new Date(q.from) : undefined, to: q.to ? new Date(q.to) : undefined, page: q.page, pageSize: q.pageSize });
  }

  @Get(':id')
  getById(@Param('id') id: string) { return this.get.execute(id) }

  @Post(':id/export')
  export(@Param('id') id: string, @Body() body: ExportRseReportDto) { return this.exportUc.execute(id, body.format) }
}

