import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateComfortIndicatorDto } from '../dto/create-comfort-indicator.dto';
import { ComfortIndicatorsService } from '../services/comfort-indicators.service';

@Controller('comfort_indicators')
export class ComfortIndicatorsController {
  constructor(private readonly indicators: ComfortIndicatorsService) {}

  @Post()
  create(@Body() dto: CreateComfortIndicatorDto) {
    return this.indicators.create(dto);
  }

  @Get()
  list(@Query('location_id') locationId?: string) {
    return this.indicators.findAll(locationId);
  }
}
