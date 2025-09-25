import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateTicketCostDto } from '../dto/create-ticket-cost.dto';
import { TicketCostsService } from '../services/ticket-costs.service';

@Controller('tickets/:id/costs')
export class TicketCostsController {
  constructor(private readonly costs: TicketCostsService) {}

  @Post()
  create(@Param('id') ticketId: string, @Body() dto: CreateTicketCostDto) {
    return this.costs.create(ticketId, dto);
  }

  @Get()
  list(@Param('id') ticketId: string) {
    return this.costs.findAll(ticketId);
  }
}

@Controller('ticket_costs')
export class TicketCostsAdminController {
  constructor(private readonly costs: TicketCostsService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costs.remove(id);
  }
}
