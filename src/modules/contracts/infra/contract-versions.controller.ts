import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
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
import { ConflictError, DomainError, ForbiddenError, NotFoundError } from '../domain/errors';

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
  async create(@Body() dto: CreateContractVersionDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.execute(() => this.createVersion.execute(actor, dto));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateContractVersionDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.execute(() => this.updateVersion.execute(actor, id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @AdminContextDecorator() actor: AuthenticatedActor) {
    await this.execute(() => this.deleteVersion.execute(actor, id));
  }

  @Get()
  async list(@Query('contractId') contractId: string, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.execute(() => this.listVersions.execute(actor, contractId));
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof DomainError) {
        if (error instanceof ConflictError) throw new ConflictException(error.message);
        if (error instanceof ForbiddenError) throw new ForbiddenException(error.message);
        if (error instanceof NotFoundError) throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
