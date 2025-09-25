import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateRseReportDto } from './dto/create-rse-report.dto';
import { ListRseReportsQueryDto } from './dto/list-rse-reports.query.dto';
import { RseReportsService } from './rse-reports.service';

@Controller('rse_reports')
export class RseReportsController {
  constructor(private readonly reports: RseReportsService) {}

  @Post()
  generate(@Body() dto: CreateRseReportDto) {
    return this.reports.generate(dto);
  }

  @Get()
  get(@Query() query: ListRseReportsQueryDto) {
    return this.reports.getForCompany(query.companyId);
  }
}
