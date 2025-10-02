import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { CreateContractVersion } from '../domain/use-cases/CreateContractVersion';
import { UpdateContractVersion } from '../domain/use-cases/UpdateContractVersion';
import { DeleteContractVersion } from '../domain/use-cases/DeleteContractVersion';
import { ListContractVersions } from '../domain/use-cases/ListContractVersions';
import { CreateContractVersionDto, UpdateContractVersionDto } from './dto';

@Controller('contracts/versions')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, ScopesGuard, CompanyScopeGuard)
export class ContractVersionsControllerV2 {
  constructor(
    private readonly createVersion: CreateContractVersion,
    private readonly updateVersion: UpdateContractVersion,
    private readonly deleteVersion: DeleteContractVersion,
    private readonly listVersions: ListContractVersions,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateContractVersionDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.createVersion.execute(actor, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractVersionDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.updateVersion.execute(actor, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @AdminContextDecorator() actor: AuthenticatedActor) {
    await this.deleteVersion.execute(actor, id);
  }

  @Get()
  list(@Query('contractId') contractId: string, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.listVersions.execute(actor, contractId);
  }
}
