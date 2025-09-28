import { Inject, Injectable } from '@nestjs/common';
import { ForbiddenError, NotFoundError, ConflictError } from '../errors';
import type { CategoryRepository } from '../ports';
import { CATEGORY_REPOSITORY } from '../ports';
import { canDeleteCategory } from '../policies';

export interface DeleteCategoryInput {
  id: string;
  companyId: string;
}

@Injectable()
export class DeleteCategory {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepository,
  ) {}

  async execute({ id, companyId }: DeleteCategoryInput): Promise<void> {
    const category = await this.categories.findById(id);
    if (!category) {
      throw new NotFoundError('taxonomy.category.not_found');
    }
    if (category.companyId !== companyId) {
      throw new ForbiddenError('taxonomy.category.company_mismatch');
    }

    const canDelete = canDeleteCategory({
      hasContracts: (await this.categories.countContracts(id)) > 0,
      hasTickets: (await this.categories.countTickets(id)) > 0,
      hasSkills: (await this.categories.countCategorySkills(id)) > 0,
    });

    if (!canDelete) {
      throw new ConflictError('taxonomy.category.delete_conflict');
    }

    await this.categories.deleteById(id);
  }
}
