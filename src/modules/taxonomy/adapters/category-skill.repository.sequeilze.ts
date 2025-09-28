import { Op } from 'sequelize';
import { CategorySkill } from '../models/category-skill.model';
import { Skill } from '../models/skill.model';
import { Category } from '../models/category.model';
import { CategorySkillRepository } from '../domain/ports';
import { Category as CategoryEntity } from '../domain/entities/Category';
import { Skill as SkillEntity } from '../domain/entities/Skill';
import { mapCategory, mapSkill, mapCategorySkill } from './mappers';

export class SequelizeCategorySkillRepository
  implements CategorySkillRepository
{
  async link(categoryId: string, skillId: string) {
    const [link] = await CategorySkill.findOrCreate({
      where: { categoryId, skillId },
      defaults: { categoryId, skillId },
    });
    return mapCategorySkill(link);
  }

  async unlink(categoryId: string, skillId: string): Promise<void> {
    await CategorySkill.destroy({ where: { categoryId, skillId } });
  }

  async listSkillsByCategory(categoryId: string): Promise<SkillEntity[]> {
    const links = await CategorySkill.findAll({ where: { categoryId } });
    if (!links.length) return [];
    const skillIds = links.map((link) => link.skillId);
    const rows = await Skill.findAll({
      where: { id: { [Op.in]: skillIds } },
      order: [['key', 'ASC']],
    });
    return rows.map(mapSkill);
  }

  async listCategoriesBySkill(skillId: string): Promise<CategoryEntity[]> {
    const links = await CategorySkill.findAll({ where: { skillId } });
    if (!links.length) return [];
    const categoryIds = links.map((link) => link.categoryId);
    const rows = await Category.findAll({
      where: { id: { [Op.in]: categoryIds } },
      order: [['key', 'ASC']],
    });
    return rows.map(mapCategory);
  }
}
