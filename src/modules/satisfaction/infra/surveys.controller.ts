import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { SubmitSurvey } from '../domain/use-cases/SubmitSurvey';
import { ListSurveys } from '../domain/use-cases/ListSurveys';
import { SubmitSurveyDto, ListSurveysQueryDto } from './dto';

@Controller('satisfaction')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class SurveysControllerV2 {
  constructor(private readonly submit: SubmitSurvey, private readonly list: ListSurveys) {}

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  submitSurvey(@Body() dto: SubmitSurveyDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.submit.execute(actor.id, dto);
  }

  @Get()
  listSurveys(@Query() q: ListSurveysQueryDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.list.execute(actor.id, { companyId: q.companyId, siteIds: q.siteIds, from: q.from ? new Date(q.from) : undefined, to: q.to ? new Date(q.to) : undefined, page: q.page, pageSize: q.pageSize });
  }
}

