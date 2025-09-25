import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { Scopes } from '../../auth/decorators/scopes.decorator';
import { AdminContextDecorator } from '../../auth/decorators/admin-context.decorator';
import { TaxonomyService } from '../services/taxonomy.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CreateSkillDto } from '../dto/create-skill.dto';
import { MapCategorySkillDto } from '../dto/map-category-skill.dto';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';

@Controller('companies/:companyId/taxonomy')
@UseGuards(JwtAuthGuard, RequireAdminRoleGuard, ScopesGuard)
export class TaxonomyController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  @Scopes('category:read')
  @Get('categories')
  listCategories(
    @Param('companyId') companyId: string,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.taxonomy.listCategories(actor, companyId);
  }

  @Scopes('category:write')
  @Post('categories')
  createCategory(
    @Param('companyId') companyId: string,
    @Body() dto: CreateCategoryDto,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.taxonomy.createCategory(actor, companyId, dto);
  }

  @Scopes('category:write')
  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.taxonomy.updateCategory(actor, id, dto);
  }

  @Scopes('category:write')
  @Delete('categories/:id')
  removeCategory(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.taxonomy.removeCategory(actor, id, companyId);
  }

  @Scopes('skill:read')
  @Get('skills')
  listSkills(
    @Param('companyId') companyId: string,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.taxonomy.listSkills(actor, companyId);
  }

  @Scopes('skill:write')
  @Post('skills')
  createSkill(
    @Param('companyId') companyId: string,
    @Body() dto: CreateSkillDto,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.taxonomy.createSkill(actor, companyId, dto);
  }

  @Scopes('skill:write')
  @Delete('skills/:id')
  removeSkill(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.taxonomy.removeSkill(actor, id, companyId);
  }

  @Scopes('category:write', 'skill:write')
  @Post('category-skills')
  mapCategorySkill(
    @Param('companyId') companyId: string,
    @Body() dto: MapCategorySkillDto,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.taxonomy.mapCategorySkill(actor, companyId, dto.categoryId, dto.skillId);
  }

  @Scopes('category:write', 'skill:write')
  @Delete('category-skills/:categoryId/:skillId')
  unmapCategorySkill(
    @Param('companyId') companyId: string,
    @Param('categoryId') categoryId: string,
    @Param('skillId') skillId: string,
    @AdminContextDecorator() actor: AuthenticatedActor,
  ) {
    return this.taxonomy.unmapCategorySkill(actor, companyId, categoryId, skillId);
  }
}
