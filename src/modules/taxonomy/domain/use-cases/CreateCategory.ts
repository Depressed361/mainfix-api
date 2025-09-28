import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../entities/Category';
import { ConflictError } from '../errors';
import type { CategoryRepository } from '../ports';
import { CATEGORY_REPOSITORY } from '../ports';

export interface CreateCategoryInput {
  companyId: string;
  key: string;
  label: string;
}

@Injectable()
export class CreateCategory {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepository,
  ) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const existing = await this.categories.findByKey(
      input.companyId,
      input.key,
    );
    if (existing) {
      throw new ConflictError('taxonomy.category.key_conflict');
    }

    return this.categories.create({
      companyId: input.companyId,
      key: input.key,
      label: input.label,
    });
  }
}
