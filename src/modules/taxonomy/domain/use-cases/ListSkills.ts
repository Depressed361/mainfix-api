import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../entities/Category';
import { Skill } from '../entities/Skill';
import type { CategorySkillRepository, SkillRepository } from '../ports';
import {
  SkillListOptions,
  CATEGORY_SKILL_REPOSITORY,
  SKILL_REPOSITORY,
} from '../ports';

export interface ListSkillsInput extends SkillListOptions {
  companyId: string;
}

export interface ListSkillsResult {
  items: Skill[];
  categoriesBySkill?: Record<string, Category[]>;
}

@Injectable()
export class ListSkills {
  constructor(
    @Inject(SKILL_REPOSITORY)
    private readonly skills: SkillRepository,
    @Inject(CATEGORY_SKILL_REPOSITORY)
    private readonly categorySkills: CategorySkillRepository,
  ) {}

  async execute({
    companyId,
    includeCategories,
    ...filters
  }: ListSkillsInput): Promise<ListSkillsResult> {
    const items = await this.skills.list(companyId, {
      includeCategories,
      ...filters,
    });

    if (!includeCategories) {
      return { items };
    }

    const categoriesBySkill: Record<string, Category[]> = {};
    await Promise.all(
      items.map(async (skill) => {
        categoriesBySkill[skill.id] =
          await this.categorySkills.listCategoriesBySkill(skill.id);
      }),
    );

    return { items, categoriesBySkill };
  }
}
