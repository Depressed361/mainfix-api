import { Category } from '../domain/entities/Category';
import { Skill } from '../domain/entities/Skill';
import { CategorySkill } from '../domain/entities/CategorySkill';
import { Category as CategoryModel } from '../models/category.model';
import { Skill as SkillModel } from '../models/skill.model';
import { CategorySkill as CategorySkillModel } from '../models/category-skill.model';

export const mapCategory = (model: CategoryModel): Category => ({
  id: model.id,
  companyId: model.companyId,
  key: model.key,
  label: model.label,
  createdAt: model.getDataValue('createdAt') ?? undefined,
  updatedAt: model.getDataValue('updatedAt') ?? undefined,
});

export const mapSkill = (model: SkillModel): Skill => ({
  id: model.id,
  companyId: model.companyId,
  key: model.key,
  label: model.label,
  createdAt: model.getDataValue('createdAt') ?? undefined,
  updatedAt: model.getDataValue('updatedAt') ?? undefined,
});

export const mapCategorySkill = (model: CategorySkillModel): CategorySkill => ({
  categoryId: model.categoryId,
  skillId: model.skillId,
  linkedAt: model.getDataValue('createdAt') ?? undefined,
});
