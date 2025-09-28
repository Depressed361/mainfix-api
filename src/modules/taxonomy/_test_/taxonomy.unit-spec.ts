import { CreateCategory } from '../domain/use-cases/CreateCategory';
import { MapCategorySkill } from '../domain/use-cases/MapCategorySkill';
import { DeleteCategory } from '../domain/use-cases/DeleteCategory';
import {
  CategoryRepository,
  CategorySkillRepository,
  SkillRepository,
} from '../domain/ports';
import { ConflictError, CrossCompanyViolationError } from '../domain/errors';

describe('Taxonomy domain use-cases', () => {
  const categoryRepoFactory = (
    overrides: Partial<CategoryRepository> = {},
  ): CategoryRepository => ({
    async create() {
      throw new Error('not implemented');
    },
    async update() {
      throw new Error('not implemented');
    },
    async deleteById() {
      throw new Error('not implemented');
    },
    async findById() {
      return null;
    },
    async findByKey() {
      return null;
    },
    async list() {
      return [];
    },
    async countTickets() {
      return 0;
    },
    async countContracts() {
      return 0;
    },
    async countCategorySkills() {
      return 0;
    },
    ...overrides,
  });

  const skillRepoFactory = (
    overrides: Partial<SkillRepository> = {},
  ): SkillRepository => ({
    async create() {
      throw new Error('not implemented');
    },
    async update() {
      throw new Error('not implemented');
    },
    async deleteById() {
      throw new Error('not implemented');
    },
    async findById() {
      return null;
    },
    async findByKey() {
      return null;
    },
    async list() {
      return [];
    },
    async countTeamSkills() {
      return 0;
    },
    async countCategoryLinks() {
      return 0;
    },
    ...overrides,
  });

  const categorySkillRepoFactory = (
    overrides: Partial<CategorySkillRepository> = {},
  ): CategorySkillRepository => ({
    async link() {
      return { categoryId: 'cat', skillId: 'skill' };
    },
    async unlink() {
      return undefined;
    },
    async listSkillsByCategory() {
      return [];
    },
    async listCategoriesBySkill() {
      return [];
    },
    ...overrides,
  });

  it('throws a conflict when creating a category with duplicate key', async () => {
    const repo = categoryRepoFactory({
      findByKey: async () => ({
        id: 'cat1',
        companyId: 'comp',
        key: 'duplicate',
        label: 'Existing',
      }),
    });
    const useCase = new CreateCategory(repo);

    await expect(
      useCase.execute({ companyId: 'comp', key: 'duplicate', label: 'New' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('prevents mapping category and skill from different companies', async () => {
    const categories = categoryRepoFactory({
      findById: async () => ({
        id: 'cat1',
        companyId: 'compA',
        key: 'hvac',
        label: 'HVAC',
      }),
    });
    const skills = skillRepoFactory({
      findById: async () => ({
        id: 'skill1',
        companyId: 'compB',
        key: 'cooling',
        label: 'Cooling',
      }),
    });
    const mappingRepo = categorySkillRepoFactory();
    const useCase = new MapCategorySkill(categories, skills, mappingRepo);

    await expect(
      useCase.execute({ categoryId: 'cat1', skillId: 'skill1' }),
    ).rejects.toBeInstanceOf(CrossCompanyViolationError);
  });

  it('rejects category deletion when dependencies exist', async () => {
    const repo = categoryRepoFactory({
      findById: async () => ({
        id: 'cat1',
        companyId: 'compA',
        key: 'hvac',
        label: 'HVAC',
      }),
      countCategorySkills: async () => 2,
    });
    const useCase = new DeleteCategory(repo);

    await expect(
      useCase.execute({ id: 'cat1', companyId: 'compA' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
