import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { Category } from '../models/category.model';
import { Skill } from '../models/skill.model';
import { CategorySkill } from '../models/category-skill.model';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CreateSkillDto } from '../dto/create-skill.dto';

@Injectable()
export class TaxonomyService {
  constructor(
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Skill) private readonly skillModel: typeof Skill,
    @InjectModel(CategorySkill)
    private readonly categorySkillModel: typeof CategorySkill,
  ) {}

  private assertCompanyAccess(actor: AuthenticatedActor, companyId: string) {
    if (actor.scopeStrings.includes('admin:super')) return;
    if (actor.companyScopeIds.includes(companyId)) return;
    if (actor.companyId === companyId) return;
    throw new ForbiddenException('Company scope mismatch');
  }

  private getCompanyId(model: Category | Skill): string {
    return model.getDataValue('companyId');
  }

  async listCategories(actor: AuthenticatedActor, companyId: string) {
    this.assertCompanyAccess(actor, companyId);
    return this.categoryModel.findAll({
      where: { companyId },
      order: [['key', 'ASC']],
    });
  }

  async createCategory(
    actor: AuthenticatedActor,
    companyId: string,
    dto: CreateCategoryDto,
  ) {
    this.assertCompanyAccess(actor, companyId);
    try {
      return await this.categoryModel.create({
        companyId,
        key: dto.key,
        label: dto.label,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException(
          'Category key already exists for this company',
        );
      }
      throw error;
    }
  }

  async updateCategory(
    actor: AuthenticatedActor,
    id: string,
    patch: UpdateCategoryDto,
  ) {
    const category = await this.categoryModel.findByPk(id);
    if (!category) throw new NotFoundException('Category not found');

    const categoryCompanyId = this.getCompanyId(category);
    this.assertCompanyAccess(actor, categoryCompanyId);

    if (patch.key !== undefined) {
      category.set('key', patch.key);
    }
    if (patch.label !== undefined) {
      category.set('label', patch.label);
    }

    try {
      await category.save();
      return category;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException(
          'Category key already exists for this company',
        );
      }
      throw error;
    }
  }

  async removeCategory(
    actor: AuthenticatedActor,
    id: string,
    companyId: string,
  ) {
    this.assertCompanyAccess(actor, companyId);
    const removed = await this.categoryModel.destroy({
      where: { id, companyId },
    });
    if (removed === 0) {
      throw new NotFoundException('Category not found');
    }
    return { deleted: true } as const;
  }

  async listSkills(actor: AuthenticatedActor, companyId: string) {
    this.assertCompanyAccess(actor, companyId);
    return this.skillModel.findAll({
      where: { companyId },
      order: [['key', 'ASC']],
    });
  }

  async createSkill(
    actor: AuthenticatedActor,
    companyId: string,
    dto: CreateSkillDto,
  ) {
    this.assertCompanyAccess(actor, companyId);
    try {
      return await this.skillModel.create({
        companyId,
        key: dto.key,
        label: dto.label,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException(
          'Skill key already exists for this company',
        );
      }
      throw error;
    }
  }

  async removeSkill(actor: AuthenticatedActor, id: string, companyId: string) {
    this.assertCompanyAccess(actor, companyId);
    const removed = await this.skillModel.destroy({ where: { id, companyId } });
    if (removed === 0) {
      throw new NotFoundException('Skill not found');
    }
    return { deleted: true } as const;
  }

  async mapCategorySkill(
    actor: AuthenticatedActor,
    companyId: string,
    categoryId: string,
    skillId: string,
  ) {
    const [category, skill] = await Promise.all([
      this.categoryModel.findByPk(categoryId),
      this.skillModel.findByPk(skillId),
    ]);

    if (!category || !skill) {
      throw new NotFoundException('Category or skill not found');
    }

    const categoryCompanyId = this.getCompanyId(category);
    const skillCompanyId = this.getCompanyId(skill);

    this.assertCompanyAccess(actor, companyId);
    if (categoryCompanyId !== companyId || skillCompanyId !== companyId) {
      throw new ForbiddenException('Cross-company mapping is not allowed');
    }

    await this.categorySkillModel.findOrCreate({
      where: { categoryId, skillId },
      defaults: { categoryId, skillId },
    });
    return { categoryId, skillId };
  }

  async unmapCategorySkill(
    actor: AuthenticatedActor,
    companyId: string,
    categoryId: string,
    skillId: string,
  ) {
    this.assertCompanyAccess(actor, companyId);
    await this.categorySkillModel.destroy({ where: { categoryId, skillId } });
    return { ok: true } as const;
  }
}
