import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../entities/Category';
import { Skill } from '../entities/Skill';
import type {
  CategoryRepository,
  CategorySkillRepository,
  CategoryListOptions,
} from '../ports';
import { CATEGORY_REPOSITORY, CATEGORY_SKILL_REPOSITORY } from '../ports';

export interface ListCategoriesInput extends CategoryListOptions {
  companyId: string;
}

export interface ListCategoriesResult {
  items: Category[];
  skillsByCategory?: Record<string, Skill[]>;
}

@Injectable()
export class ListCategories {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepository,
    @Inject(CATEGORY_SKILL_REPOSITORY)
    private readonly categorySkills: CategorySkillRepository,
  ) {}

  async execute({
    companyId,
    includeSkills,
    ...filters
  }: ListCategoriesInput): Promise<ListCategoriesResult> {
    const items = await this.categories.list(companyId, {
      includeSkills,
      ...filters,
    });

    if (!includeSkills) {
      return { items };
    }

    const skillsByCategory: Record<string, Skill[]> = {};
    await Promise.all(
      items.map(async (category) => {
        skillsByCategory[category.id] =
          await this.categorySkills.listSkillsByCategory(category.id);
      }),
    );

    return { items, skillsByCategory };
  }
}
