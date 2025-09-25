import { Controller, Get, Query } from '@nestjs/common';
import { WellBeingService } from '../services/well-being.service';

@Controller('well_being_scores')
export class WellBeingController {
  constructor(private readonly wb: WellBeingService) {}

  @Get()
  list(@Query('site_id') siteId?: string) {
    return this.wb.findAll(siteId);
  }
}

