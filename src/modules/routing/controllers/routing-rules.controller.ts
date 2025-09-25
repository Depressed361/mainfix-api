import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CreateRoutingRuleDto } from '../dto/create-routing-rule.dto';
import { ListRoutingRulesQueryDto } from '../dto/list-routing-rules.query.dto';
import { RoutingRulesService } from '../services/routing-rules.service';

@Controller('routing_rules')
export class RoutingRulesController {
  constructor(private readonly rules: RoutingRulesService) {}

  @Post()
  create(@Body() dto: CreateRoutingRuleDto) {
    return this.rules.create(dto);
  }

  @Get()
  list(@Query() query: ListRoutingRulesQueryDto) {
    return this.rules.findAll(query.contractVersionId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rules.remove(id);
  }
}
