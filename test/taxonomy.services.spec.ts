import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { SqliteTestingModule } from './utils/slqlite-testing.module';
import { TaxonomyService } from '../src/modules/taxonomy/services/taxonomy.service';
import { Category } from '../src/modules/taxonomy/models/category.model';
import { Skill } from '../src/modules/taxonomy/models/skill.model';
import { CategorySkill } from '../src/modules/taxonomy/models/category-skill.model';
import type { AuthenticatedActor } from '../src/modules/auth/auth-actor.types';

const buildCompanyActor = (companyId: string): AuthenticatedActor => ({
  id: 'actor-' + companyId,
  email: companyId + '@example.com',
  role: 'admin',
  companyId,
  siteId: undefined,
  scopes: [],
  scopeStrings: [
    'category:read',
    'category:write',
    'skill:read',
    'skill:write',
    'admin:company',
  ],
  companyScopeIds: [companyId],
  siteScopeIds: [],
  buildingScopeIds: [],
});

const buildSuperAdmin = (): AuthenticatedActor => ({
  id: 'super-admin',
  email: 'super@mainfix.test',
  role: 'admin',
  companyId: 'super-company',
  siteId: undefined,
  scopes: [],
  scopeStrings: [
    'admin:super',
    'category:read',
    'category:write',
    'skill:read',
    'skill:write',
  ],
  companyScopeIds: [],
  siteScopeIds: [],
  buildingScopeIds: [],
});

describe('TaxonomyService', () => {
  let moduleRef: TestingModule;
  let service: TaxonomyService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        SqliteTestingModule([Category, Skill, CategorySkill]),
        SequelizeModule.forFeature([Category, Skill, CategorySkill]),
      ],
      providers: [TaxonomyService],
    }).compile();

    service = moduleRef.get(TaxonomyService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('creates, lists, updates and deletes categories within a company', async () => {
    const actor = buildCompanyActor('company-a');
    const created = await service.createCategory(actor, 'company-a', {
      key: 'safety',
      label: 'Safety',
    });

    const listed = await service.listCategories(actor, 'company-a');
    expect(listed.map((row) => row.getDataValue('key'))).toContain('safety');

    const updated = await service.updateCategory(actor, created.id, {
      label: 'Workplace Safety',
    });
    expect(updated.getDataValue('label')).toBe('Workplace Safety');

    const removal = await service.removeCategory(actor, created.id, 'company-a');
    expect(removal).toEqual({ deleted: true });
  });

  it('manages skills and allows mapping within the same company', async () => {
    const actor = buildCompanyActor('company-b');
    const category = await service.createCategory(actor, 'company-b', {
      key: 'operations',
      label: 'Operations',
    });
    const skill = await service.createSkill(actor, 'company-b', {
      key: 'forklift',
      label: 'Forklift Driving',
    });

    const mapping = await service.mapCategorySkill(
      actor,
      'company-b',
      category.id,
      skill.id,
    );
    expect(mapping).toEqual({ categoryId: category.id, skillId: skill.id });

    const unmap = await service.unmapCategorySkill(
      actor,
      'company-b',
      category.id,
      skill.id,
    );
    expect(unmap).toEqual({ ok: true });
  });

  it('blocks cross-company mapping attempts', async () => {
    const superAdmin = buildSuperAdmin();
    const category = await service.createCategory(superAdmin, 'company-c', {
      key: 'logistics',
      label: 'Logistics',
    });

    const foreignSkill = await service.createSkill(superAdmin, 'company-d', {
      key: 'welding',
      label: 'Welding',
    });

    await expect(
      service.mapCategorySkill(
        superAdmin,
        'company-c',
        category.id,
        foreignSkill.id,
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
