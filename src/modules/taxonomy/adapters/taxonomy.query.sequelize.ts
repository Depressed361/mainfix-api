import { Op } from 'sequelize';
import { TaxonomyQuery } from '../domain/ports';
import { CategorySkill } from '../models/category-skill.model';
import { Category } from '../models/category.model';
import { Skill } from '../models/skill.model';

export class SequelizeTaxonomyQuery implements TaxonomyQuery {
  async resolveSkillsForCategory(categoryId: string): Promise<string[]> {
    const links = await CategorySkill.findAll({
      attributes: ['skillId'],
      where: { categoryId },
      order: [['skillId', 'ASC']],
    });
    return links.map((link) => link.skillId);
  }

  async dictionaryByCompany(
    companyId: string,
  ): Promise<Record<string, string[]>> {
    const categories = await Category.findAll({
      attributes: ['id', 'key'],
      where: { companyId },
      order: [['key', 'ASC']],
    });

    if (!categories.length) return {};

    const categoryIds = categories.map((category) => category.id);
    const links = await CategorySkill.findAll({
      attributes: ['categoryId', 'skillId'],
      where: { categoryId: { [Op.in]: categoryIds } },
      order: [['categoryId', 'ASC']],
    });

    if (!links.length) {
      return Object.fromEntries(
        categories.map((category) => [category.key, []]),
      );
    }

    const skillIds = Array.from(new Set(links.map((link) => link.skillId)));
    const skills = await Skill.findAll({
      attributes: ['id', 'key'],
      where: { id: { [Op.in]: skillIds } },
    });
    const skillKeys = new Map(skills.map((skill) => [skill.id, skill.key]));

    const dictionary: Record<string, string[]> = {};
    const categoryKeyById = new Map(
      categories.map((category) => [category.id, category.key]),
    );
    for (const key of categoryKeyById.values()) {
      dictionary[key] = [];
    }
    for (const link of links) {
      const categoryKey = categoryKeyById.get(link.categoryId);
      if (!categoryKey) continue;
      const skillKey = skillKeys.get(link.skillId);
      if (!skillKey) continue;
      dictionary[categoryKey].push(skillKey);
    }

    Object.keys(dictionary).forEach((key) => {
      dictionary[key].sort();
    });

    return dictionary;
  }
}
