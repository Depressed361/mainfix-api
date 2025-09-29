import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../entities/Category';
import { ConflictError, ForbiddenError, NotFoundError } from '../errors';
import type { CategoryRepository } from '../ports';
import { CATEGORY_REPOSITORY } from '../ports';

export interface UpdateCategoryInput {
  id: string;
  companyId: string;
  patch: Partial<Pick<Category, 'key' | 'label'>>;
}

@Injectable()
export class UpdateCategory {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepository,
  ) {}

  async execute({
    id,
    companyId,
    patch,
  }: UpdateCategoryInput): Promise<Category> {
    const category = await this.categories.findById(id);
    if (!category) {
      throw new NotFoundError('taxonomy.category.not_found');
    }
    if (category.companyId !== companyId) {
      throw new ForbiddenError('taxonomy.category.company_mismatch');
    }

    if (patch.key && patch.key !== category.key) {
      const existing = await this.categories.findByKey(companyId, patch.key);
      if (existing) {
        throw new ConflictError('taxonomy.category.key_conflict');
      }
    }

    return this.categories.update(id, patch);
  }
}
