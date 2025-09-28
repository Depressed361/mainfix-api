import { Op } from 'sequelize';
import { Skill } from '../models/skill.model';
import { CategorySkill } from '../models/category-skill.model';
import { TeamSkill } from '../../competency/models/team-skills.model';
import { SkillRepository, SkillListOptions } from '../domain/ports';
import { Skill as SkillEntity } from '../domain/entities/Skill';
import { mapSkill } from './mappers';

const DEFAULT_PAGE_SIZE = 25;

export class SequelizeSkillRepository implements SkillRepository {
  async create(data: {
    companyId: string;
    key: string;
    label: string;
  }): Promise<SkillEntity> {
    const row = await Skill.create({
      companyId: data.companyId,
      key: data.key,
      label: data.label,
    });
    return mapSkill(row);
  }

  async update(
    id: string,
    patch: Partial<{ companyId: string; key: string; label: string }>,
  ): Promise<SkillEntity> {
    const row = await Skill.findByPk(id);
    if (!row) throw new Error('SKILL_NOT_FOUND');
    await row.update(patch);
    return mapSkill(row);
  }

  async deleteById(id: string): Promise<void> {
    await Skill.destroy({ where: { id } });
  }

  async findById(id: string): Promise<SkillEntity | null> {
    const row = await Skill.findByPk(id);
    return row ? mapSkill(row) : null;
  }

  async findByKey(companyId: string, key: string): Promise<SkillEntity | null> {
    const row = await Skill.findOne({ where: { companyId, key } });
    return row ? mapSkill(row) : null;
  }

  async list(
    companyId: string,
    options: SkillListOptions,
  ): Promise<SkillEntity[]> {
    const where: Record<string, unknown> = { companyId };
    if (options.search) {
      where.label = { [Op.iLike]: `%${options.search}%` };
    }
    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
    const page = options.page ?? 1;
    const rows = await Skill.findAll({
      where,
      order: [['key', 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return rows.map(mapSkill);
  }

  countTeamSkills(skillId: string): Promise<number> {
    return TeamSkill.count({ where: { skillId } });
  }

  countCategoryLinks(skillId: string): Promise<number> {
    return CategorySkill.count({ where: { skillId } });
  }
}
