import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Patch,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import {
  CreateCategoryDto,
  CreateSkillDto,
  ListCategoriesQueryDto,
  ListSkillsQueryDto,
  MapCategorySkillDto,
  UpdateCategoryDto,
} from './dto';
import { CreateCategory } from '../domain/use-cases/CreateCategory';
import { UpdateCategory } from '../domain/use-cases/UpdateCategory';
import { CreateSkill } from '../domain/use-cases/CreateSkill';
import { UpdateSkill } from '../domain/use-cases/UpdateSkill';
import { ListCategories } from '../domain/use-cases/ListCategories';
import { ListSkills } from '../domain/use-cases/ListSkills';
import { MapCategorySkill } from '../domain/use-cases/MapCategorySkill';
import { UnmapCategorySkill } from '../domain/use-cases/UnmapCategorySkill';
import { ConflictError, CrossCompanyViolationError, DomainError, ForbiddenError, NotFoundError } from '../domain/errors';

@UseGuards(JwtAuthGuard)
@Controller('taxonomy')
export class TaxonomySelfController {
  constructor(
    private readonly createCategory: CreateCategory,
    private readonly updateCategory: UpdateCategory,
    private readonly createSkill: CreateSkill,
    private readonly updateSkill: UpdateSkill,
    private readonly listCategories: ListCategories,
    private readonly listSkills: ListSkills,
    private readonly mapCategorySkill: MapCategorySkill,
    private readonly unmapCategorySkill: UnmapCategorySkill,
  ) {}

  private getCompanyId(req: Request & { user?: any }): string {
    const companyId = (req.user && (req.user.companyId || req.user.company_id)) as string | undefined;
    if (!companyId) throw new NotFoundException('Missing user companyId');
    return companyId;
  }

  @Get('categories')
  async listAllCategories(@Query() q: ListCategoriesQueryDto, @Req() req: Request & { user?: any }) {
    const companyId = this.getCompanyId(req);
    const includeSkills = String((q as any).includeSkills ?? (q as any).include_skills ?? '').toLowerCase();
    const inc = includeSkills === '1' || includeSkills === 'true';
    const page = q.page ? Number(q.page) : undefined;
    const pageSize = q.pageSize ? Number(q.pageSize) : undefined;

    const { items, skillsByCategory } = await this.execute(() =>
      this.listCategories.execute({ companyId, includeSkills: inc, search: q.search, page, pageSize }),
    );

    if (!inc) return items;
    const enriched = items.map((c: any) => ({ ...c, skills: (skillsByCategory || {})[c.id] || [] }));
    return enriched;
  }

  @Post('categories')
  async createNewCategory(@Body() dto: CreateCategoryDto, @Req() req: Request & { user?: any }) {
    const companyId = this.getCompanyId(req);
    return this.execute(() => this.createCategory.execute({ companyId, key: dto.key, label: dto.label }));
  }

  @Patch('categories/:id')
  async updateExistingCategory(@Req() req: Request & { user?: any }, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.execute(() => this.updateCategory.execute({ id, companyId: this.getCompanyId(req), patch: { key: dto.key, label: dto.label } }));
  }

  @Get('skills')
  async listAllSkills(@Query() q: ListSkillsQueryDto, @Req() req: Request & { user?: any }) {
    const companyId = this.getCompanyId(req);
    const includeCategories = String((q as any).includeCategories ?? (q as any).include_categories ?? '').toLowerCase();
    const inc = includeCategories === '1' || includeCategories === 'true';
    const page = q.page ? Number(q.page) : undefined;
    const pageSize = q.pageSize ? Number(q.pageSize) : undefined;
    const { items, categoriesBySkill } = await this.execute(() =>
      this.listSkills.execute({ companyId, includeCategories: inc, search: q.search, page, pageSize }),
    );
    if (!inc) return items;
    const enriched = items.map((s: any) => ({ ...s, categories: (categoriesBySkill || {})[s.id] || [] }));
    return enriched;
  }

  @Post('skills')
  async createNewSkill(@Body() dto: CreateSkillDto, @Req() req: Request & { user?: any }) {
    const companyId = this.getCompanyId(req);
    return this.execute(() => this.createSkill.execute({ companyId, key: dto.key, label: dto.label }));
  }

  @Post('category-skills')
  @HttpCode(200)
  async mapSkill(@Body() dto: MapCategorySkillDto) {
    return this.execute(() => this.mapCategorySkill.execute({ categoryId: dto.categoryId, skillId: dto.skillId }));
  }

  @Delete('category-skills/:categoryId/:skillId')
  @HttpCode(204)
  async unmapSkill(@Req() _req: Request, @Param() params: any) {
    const { categoryId, skillId } = params as { categoryId: string; skillId: string };
    return this.execute(async () => {
      await this.unmapCategorySkill.execute({ categoryId, skillId });
    });
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
      if (error instanceof ForbiddenError || error instanceof CrossCompanyViolationError) {
        throw new (require('@nestjs/common').ForbiddenException)(error.message);
      }
      if (error instanceof ConflictError) {
        throw new (require('@nestjs/common').ConflictException)(error.message);
      }
    }
    throw error;
  }
}
