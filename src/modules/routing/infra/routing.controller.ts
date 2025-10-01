import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { CreateRoutingRule } from '../domain/use-cases/CreateRoutingRule';
import { UpdateRoutingRule } from '../domain/use-cases/UpdateRoutingRule';
import { DeleteRoutingRule } from '../domain/use-cases/DeleteRoutingRule';
import { ListRoutingRules } from '../domain/use-cases/ListRoutingRules';
import { SimulateRouting } from '../domain/use-cases/SimulateRouting';
import { CreateRoutingRuleDto, ListRoutingRulesQueryDto, SimulationDto, UpdateRoutingRuleDto } from './dto';
import { mapDomainError } from './errors';

@Controller('companies/:companyId/routing')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, ScopesGuard, CompanyScopeGuard)
export class RoutingController {
  constructor(
    private readonly createRule: CreateRoutingRule,
    private readonly updateRule: UpdateRoutingRule,
    private readonly deleteRule: DeleteRoutingRule,
    private readonly listRules: ListRoutingRules,
    private readonly simulate: SimulateRouting,
  ) {}

  @Post('rules')
  create(
    @Body() dto: CreateRoutingRuleDto,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.createRule.execute(actor, dto as any).catch(mapDomainError);
  }

  @Patch('rules/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoutingRuleDto,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.updateRule.execute(actor, { id, ...(dto as any) }).catch(mapDomainError);
  }

  @Delete('rules/:id')
  async remove(
    @Param('id') id: string,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    await this.deleteRule.execute(actor, id).catch(mapDomainError);
    return { deleted: true };
  }

  @Get('rules')
  list(
    @Query() query: ListRoutingRulesQueryDto,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.listRules.execute(actor, query.contractVersionId).catch(mapDomainError);
  }

  @Post('simulate')
  simulateRouting(
    @Body() dto: SimulationDto,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.simulate.execute(actor, dto).catch(mapDomainError);
  }
}
