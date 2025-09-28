import { Op } from 'sequelize';
import { Category } from '../models/category.model';
import { CategorySkill } from '../models/category-skill.model';
import { Ticket } from '../../tickets/models/ticket.model';
import { ContractCategory } from '../../contracts/models/contract-category.model';
import { CategoryRepository, CategoryListOptions } from '../domain/ports';
import { Category as CategoryEntity } from '../domain/entities/Category';
import { mapCategory } from './mappers';

const DEFAULT_PAGE_SIZE = 25;

export class SequelizeCategoryRepository implements CategoryRepository {
  async create(data: {
    companyId: string;
    key: string;
    label: string;
  }): Promise<CategoryEntity> {
    const row = await Category.create({
      companyId: data.companyId,
      key: data.key,
      label: data.label,
    });
    return mapCategory(row);
  }

  async update(
    id: string,
    patch: Partial<{ companyId: string; key: string; label: string }>,
  ): Promise<CategoryEntity> {
    const row = await Category.findByPk(id);
    if (!row) throw new Error('CATEGORY_NOT_FOUND');
    await row.update(patch);
    return mapCategory(row);
  }

  async deleteById(id: string): Promise<void> {
    await Category.destroy({ where: { id } });
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const row = await Category.findByPk(id);
    return row ? mapCategory(row) : null;
  }

  async findByKey(
    companyId: string,
    key: string,
  ): Promise<CategoryEntity | null> {
    const row = await Category.findOne({ where: { companyId, key } });
    return row ? mapCategory(row) : null;
  }

  async list(
    companyId: string,
    options: CategoryListOptions,
  ): Promise<CategoryEntity[]> {
    const where: Record<string, unknown> = { companyId };
    if (options.search) {
      where.label = { [Op.iLike]: `%${options.search}%` };
    }
    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
    const page = options.page ?? 1;
    const rows = await Category.findAll({
      where,
      order: [['key', 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return rows.map(mapCategory);
  }

  countTickets(categoryId: string): Promise<number> {
    return Ticket.count({ where: { categoryId } });
  }

  countContracts(categoryId: string): Promise<number> {
    return ContractCategory.count({ where: { categoryId } });
  }

  countCategorySkills(categoryId: string): Promise<number> {
    return CategorySkill.count({ where: { categoryId } });
  }
}
