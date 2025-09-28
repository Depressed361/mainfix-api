import { Category, CategoryProps } from './entities/Category';
import { Skill, SkillProps } from './entities/Skill';
import { CategorySkill } from './entities/CategorySkill';

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export const CATEGORY_REPOSITORY = Symbol('CategoryRepository');
export const SKILL_REPOSITORY = Symbol('SkillRepository');
export const CATEGORY_SKILL_REPOSITORY = Symbol('CategorySkillRepository');
export const TAXONOMY_QUERY = Symbol('TaxonomyQuery');

export interface CategoryListOptions extends PaginationOptions {
  search?: string;
  includeSkills?: boolean;
}

export interface SkillListOptions extends PaginationOptions {
  search?: string;
  includeCategories?: boolean;
}

export interface CategoryRepository {
  create(data: CategoryProps): Promise<Category>;
  update(id: string, patch: Partial<CategoryProps>): Promise<Category>;
  deleteById(id: string): Promise<void>;
  findById(id: string): Promise<Category | null>;
  findByKey(companyId: string, key: string): Promise<Category | null>;
  list(companyId: string, options: CategoryListOptions): Promise<Category[]>;
  countTickets(categoryId: string): Promise<number>;
  countContracts(categoryId: string): Promise<number>;
  countCategorySkills(categoryId: string): Promise<number>;
}

export interface SkillRepository {
  create(data: SkillProps): Promise<Skill>;
  update(id: string, patch: Partial<SkillProps>): Promise<Skill>;
  deleteById(id: string): Promise<void>;
  findById(id: string): Promise<Skill | null>;
  findByKey(companyId: string, key: string): Promise<Skill | null>;
  list(companyId: string, options: SkillListOptions): Promise<Skill[]>;
  countTeamSkills(skillId: string): Promise<number>;
  countCategoryLinks(skillId: string): Promise<number>;
}

export interface CategorySkillRepository {
  link(categoryId: string, skillId: string): Promise<CategorySkill>;
  unlink(categoryId: string, skillId: string): Promise<void>;
  listSkillsByCategory(categoryId: string): Promise<Skill[]>;
  listCategoriesBySkill(skillId: string): Promise<Category[]>;
}

export interface TaxonomyQuery {
  resolveSkillsForCategory(categoryId: string): Promise<string[]>;
  dictionaryByCompany(companyId: string): Promise<Record<string, string[]>>;
}
