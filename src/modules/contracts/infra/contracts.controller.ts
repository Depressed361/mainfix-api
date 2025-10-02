import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { CreateContract } from '../domain/use-cases/CreateContract';
import { UpdateContract } from '../domain/use-cases/UpdateContract';
import { ArchiveContract } from '../domain/use-cases/ArchiveContract';
import { ListContracts } from '../domain/use-cases/ListContracts';
import { CreateContractDto, UpdateContractDto } from './dto';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, ScopesGuard, CompanyScopeGuard)
export class ContractsControllerV2 {
  constructor(
    private readonly createContract: CreateContract,
    private readonly updateContract: UpdateContract,
    private readonly archiveContract: ArchiveContract,
    private readonly listContracts: ListContracts,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateContractDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.createContract.execute(actor, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.updateContract.execute(actor, id, dto);
  }

  @Post(':id/archive')
  async archive(@Param('id') id: string, @AdminContextDecorator() actor: AuthenticatedActor) {
    await this.archiveContract.execute(actor, id);
    return { archived: true };
  }

  @Get()
  list(@Query('siteId') siteId: string, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.listContracts.execute(actor, siteId);
  }
}
