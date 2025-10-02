import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompetencyService } from '../services/competency.service';
import { CreateCompetencyDto } from '../dto/create-competency.dto';
import { UpdateCompetencyDto } from '../dto/update-competency.dto';
import { ResolveCompetencyQueryDto } from '../dto/resolve-competency.query';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { Scopes } from '../../auth/decorators/scopes.decorator';

@UseGuards(JwtAuthGuard, ScopesGuard)
@Controller('contracts/:contractId/versions/:version/competencies')
export class CompetencyController {
  constructor(private readonly competencyService: CompetencyService) {}

  @Scopes('contract:read', 'competency:read')
  @Get()
  list(@Param('contractId') contractId: string, @Param('version') version: string) {
    return this.competencyService.listByContract(contractId, Number(version));
  }

  @Scopes('contract:write', 'competency:write', 'admin:company')
  @Post()
  create(@Body() dto: CreateCompetencyDto) {
    return this.competencyService.create(dto);
  }

  @Scopes('contract:write', 'competency:write', 'admin:company')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompetencyDto) {
    return this.competencyService.update(id, dto);
  }

  @Scopes('contract:write', 'competency:write', 'admin:company')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.competencyService.remove(id);
  }

  @Scopes('contract:read', 'competency:read')
  @Get('resolve')
  resolve(
    @Param('contractId') contractId: string,
    @Param('version') version: string,
    @Query() query: ResolveCompetencyQueryDto,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.competencyService.resolve(actor, {
      contractId,
      version: Number(version),
      categoryId: query.categoryId,
      buildingId: query.buildingId,
      window: query.window,
    });
  }
}
