import { Inject, Injectable } from '@nestjs/common';
import { CrossCompanyViolationError, NotFoundError } from '../errors';
import type {
  CategoryRepository,
  CategorySkillRepository,
  SkillRepository,
} from '../ports';
import {
  CATEGORY_REPOSITORY,
  CATEGORY_SKILL_REPOSITORY,
  SKILL_REPOSITORY,
} from '../ports';

export interface UnmapCategorySkillInput {
  categoryId: string;
  skillId: string;
}

@Injectable()
export class UnmapCategorySkill {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepository,
    @Inject(SKILL_REPOSITORY)
    private readonly skills: SkillRepository,
    @Inject(CATEGORY_SKILL_REPOSITORY)
    private readonly categorySkills: CategorySkillRepository,
  ) {}

  async execute({ categoryId, skillId }: UnmapCategorySkillInput) {
    const [category, skill] = await Promise.all([
      this.categories.findById(categoryId),
      this.skills.findById(skillId),
    ]);

    if (!category || !skill) {
      throw new NotFoundError('taxonomy.category_skill.not_found');
    }

    if (category.companyId !== skill.companyId) {
      throw new CrossCompanyViolationError(
        'taxonomy.category_skill.cross_company',
      );
    }

    await this.categorySkills.unlink(categoryId, skillId);

    return { categoryId, skillId } as const;
  }
}
