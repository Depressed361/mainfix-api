import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateSurveyDto } from '../dto/create-survey.dto';
import { SurveysService } from '../services/surveys.service';

@Controller('tickets/:id/surveys')
export class SurveysController {
  constructor(private readonly surveys: SurveysService) {}

  @Post()
  create(@Param('id') ticketId: string, @Body() dto: CreateSurveyDto) {
    return this.surveys.create(ticketId, dto);
  }

  @Get()
  list(@Param('id') ticketId: string) {
    return this.surveys.findAll(ticketId);
  }
}
