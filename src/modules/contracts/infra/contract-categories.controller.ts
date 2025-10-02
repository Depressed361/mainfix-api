import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put, Query, UseGuards, ForbiddenException, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { UpsertContractCategory } from '../domain/use-cases/UpsertContractCategory';
import { RemoveContractCategory } from '../domain/use-cases/RemoveContractCategory';
import { ListContractCategories } from '../domain/use-cases/ListContractCategories';
import { UpsertContractCategoryDto } from './dto';
import { ConflictError, DomainError, ForbiddenError, InvalidInputError, NotFoundError } from '../domain/errors';

@Controller('contracts/categories')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, ScopesGuard, CompanyScopeGuard)
export class ContractCategoriesControllerV2 {
  constructor(
    private readonly upsert: UpsertContractCategory,
    private readonly removeUseCase: RemoveContractCategory,
    private readonly listCats: ListContractCategories,
  ) {}

  @Put()
  async upsertCategory(@Body() dto: UpsertContractCategoryDto, @AdminContextDecorator() actor: AuthenticatedActor) {
    return this.execute(() => this.upsert.execute(actor, dto));
  }

  @Delete(':contractVersionId/:categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('contractVersionId') contractVersionId: string, @Param('categoryId') categoryId: string, @AdminContextDecorator() actor: AuthenticatedActor) {
    await this.execute(() => this.removeUseCase.execute(actor, contractVersionId, categoryId));
  }

  @Get()
  list(@Query('contractVersionId') contractVersionId: string) {
    return this.listCats.execute(contractVersionId);
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof DomainError) {
        if (error instanceof ForbiddenError) throw new ForbiddenException(error.message);
        if (error instanceof InvalidInputError) throw new UnprocessableEntityException(error.message);
        if (error instanceof NotFoundError) throw new NotFoundException(error.message);
        if (error instanceof ConflictError) throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }
  }
}
