import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { Scopes } from '../../auth/decorators/scopes.decorator';
import {
  CreateCategoryDto,
  CreateSkillDto,
  ListCategoriesQueryDto,
  ListSkillsQueryDto,
  MapCategorySkillDto,
  UpdateCategoryDto,
  UpdateSkillDto,
} from './dto';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import { CreateCategory } from '../domain/use-cases/CreateCategory';
import { UpdateCategory } from '../domain/use-cases/UpdateCategory';
import { DeleteCategory } from '../domain/use-cases/DeleteCategory';
import { CreateSkill } from '../domain/use-cases/CreateSkill';
import { UpdateSkill } from '../domain/use-cases/UpdateSkill';
import { DeleteSkill } from '../domain/use-cases/DeleteSkill';
import { ListCategories } from '../domain/use-cases/ListCategories';
import { ListSkills } from '../domain/use-cases/ListSkills';
import { MapCategorySkill } from '../domain/use-cases/MapCategorySkill';
import { UnmapCategorySkill } from '../domain/use-cases/UnmapCategorySkill';
import { ResolveSkillsForCategory } from '../domain/use-cases/ResolveSkillsForCategory';
import { ExportTaxonomyDictionary } from '../domain/use-cases/ExportTaxonomyDictionnary';
import {
  ConflictError,
  CrossCompanyViolationError,
  DomainError,
  ForbiddenError,
  NotFoundError,
} from '../domain/errors';

@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, ScopesGuard, CompanyScopeGuard)
@Controller('companies/:companyId/taxonomy')
export class TaxonomyController {
  constructor(
    private readonly createCategory: CreateCategory,
    private readonly updateCategory: UpdateCategory,
    private readonly deleteCategory: DeleteCategory,
    private readonly createSkill: CreateSkill,
    private readonly updateSkill: UpdateSkill,
    private readonly deleteSkill: DeleteSkill,
    private readonly listCategories: ListCategories,
    private readonly listSkills: ListSkills,
    private readonly mapCategorySkill: MapCategorySkill,
    private readonly unmapCategorySkill: UnmapCategorySkill,
    private readonly resolveSkillsForCategory: ResolveSkillsForCategory,
    private readonly exportDictionary: ExportTaxonomyDictionary,
  ) {}

  @Scopes('category:read')
  @Get('categories')
  listAllCategories(
    @Param('companyId') companyId: string,
    @Query() query: ListCategoriesQueryDto,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    const allowed = actor.scopeStrings.includes('admin:super') || actor.companyId === companyId || actor.companyScopeIds.includes(companyId);
    if (!allowed) return [];
    return this.execute(() =>
      this.listCategories.execute({
        companyId,
        includeSkills: query.includeSkills,
        search: query.search,
        page: query.page,
        pageSize: query.pageSize,
      }),
    );
  }

  @Scopes('category:write')
  @Post('categories')
  createNewCategory(
    @Param('companyId') companyId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.execute(() =>
      this.createCategory.execute({
        companyId,
        key: dto.key,
        label: dto.label,
      }),
    );
  }

  @Scopes('category:write')
  @Patch('categories/:id')
  updateExistingCategory(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.execute(() =>
      this.updateCategory.execute({
        id,
        companyId,
        patch: { key: dto.key, label: dto.label },
      }),
    );
  }

  @Scopes('category:write')
  @Delete('categories/:id')
  @HttpCode(204)
  removeCategory(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.execute(async () => {
      await this.deleteCategory.execute({ id, companyId });
    });
  }

  @Scopes('skill:read')
  @Get('skills')
  listAllSkills(
    @Param('companyId') companyId: string,
    @Query() query: ListSkillsQueryDto,
  ) {
    return this.execute(() =>
      this.listSkills.execute({
        companyId,
        includeCategories: query.includeCategories,
        search: query.search,
        page: query.page,
        pageSize: query.pageSize,
      }),
    );
  }

  @Scopes('skill:write')
  @Post('skills')
  createNewSkill(
    @Param('companyId') companyId: string,
    @Body() dto: CreateSkillDto,
  ) {
    return this.execute(() =>
      this.createSkill.execute({
        companyId,
        key: dto.key,
        label: dto.label,
      }),
    );
  }

  @Scopes('skill:write')
  @Patch('skills/:id')
  updateExistingSkill(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.execute(() =>
      this.updateSkill.execute({
        id,
        companyId,
        patch: { key: dto.key, label: dto.label },
      }),
    );
  }

  @Scopes('skill:write')
  @Delete('skills/:id')
  @HttpCode(204)
  removeSkill(@Param('companyId') companyId: string, @Param('id') id: string) {
    return this.execute(async () => {
      await this.deleteSkill.execute({ id, companyId });
    });
  }

  @Scopes('category:write', 'skill:write')
  @Post('category-skills')
  mapSkill(
    @Param('companyId') _companyId: string,
    @Body() dto: MapCategorySkillDto,
  ) {
    return this.execute(() =>
      this.mapCategorySkill.execute({
        categoryId: dto.categoryId,
        skillId: dto.skillId,
      }),
    );
  }

  @Scopes('category:write', 'skill:write')
  @Delete('category-skills/:categoryId/:skillId')
  @HttpCode(204)
  unmapSkill(
    @Param('companyId') _companyId: string,
    @Param('categoryId') categoryId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.execute(async () => {
      await this.unmapCategorySkill.execute({ categoryId, skillId });
    });
  }

  @Scopes('category:read', 'skill:read')
  @Get('categories/:categoryId/skills')
  listSkillsForCategory(@Param('categoryId') categoryId: string) {
    return this.execute(() =>
      this.resolveSkillsForCategory.execute(categoryId),
    );
  }

  @Scopes('category:read', 'skill:read')
  @Get('dictionary')
  getDictionary(@Param('companyId') companyId: string) {
    return this.execute(() => this.exportDictionary.execute(companyId));
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (error instanceof DomainError) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof ForbiddenError ||
        error instanceof CrossCompanyViolationError
      ) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof ConflictError) {
        throw new ConflictException(error.message);
      }
    }
    throw error;
  }
}
