import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TaxonomyController } from '../infra/taxonomy.controller';
import { CreateCategory } from '../domain/use-cases/CreateCategory';
import { UpdateCategory } from '../domain/use-cases/UpdateCategory';
import { DeleteCategory } from '../domain/use-cases/DeleteCategory';
import { CreateSkill } from '../domain/use-cases/CreateSkill';
import { UpdateSkill } from '../domain/use-cases/UpdateSkill';
import { DeleteSkill } from '../domain/use-cases/DeleteSkill';
import { ListCategories } from '../domain/use-cases/ListCategories';
import { ListSkills } from '../domain/use-cases/ListSkills';
import { MapCategorySkill } from '../domain/use-cases/MapCategorySkill';
import { UnmapCategorySkill } from '../domain/use-cases/UnmapCategorySkill';
import { ResolveSkillsForCategory } from '../domain/use-cases/ResolveSkillsForCategory';
import { ExportTaxonomyDictionary } from '../domain/use-cases/ExportTaxonomyDictionnary';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';

const noopProvider = { execute: jest.fn() };

const actor: AuthenticatedActor = {
  id: 'actor',
  email: 'actor@test.dev',
  role: 'admin',
  companyId: 'company-1',
  scopes: [],
  scopeStrings: [
    'category:read',
    'category:write',
    'skill:read',
    'skill:write',
  ],
  companyScopeIds: ['company-1'],
  siteScopeIds: [],
  buildingScopeIds: [],
  siteId: null,
};

describe('TaxonomyController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const dictionaryResult = { hvac: ['cooling'] };

    const moduleFixture = await Test.createTestingModule({
      controllers: [TaxonomyController],
      providers: [
        { provide: CreateCategory, useValue: { ...noopProvider } },
        { provide: UpdateCategory, useValue: { ...noopProvider } },
        { provide: DeleteCategory, useValue: { ...noopProvider } },
        { provide: CreateSkill, useValue: { ...noopProvider } },
        { provide: UpdateSkill, useValue: { ...noopProvider } },
        { provide: DeleteSkill, useValue: { ...noopProvider } },
        {
          provide: ListCategories,
          useValue: { execute: jest.fn().mockResolvedValue({ items: [] }) },
        },
        {
          provide: ListSkills,
          useValue: { execute: jest.fn().mockResolvedValue({ items: [] }) },
        },
        { provide: MapCategorySkill, useValue: { ...noopProvider } },
        { provide: UnmapCategorySkill, useValue: { ...noopProvider } },
        {
          provide: ResolveSkillsForCategory,
          useValue: { execute: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: ExportTaxonomyDictionary,
          useValue: { execute: jest.fn().mockResolvedValue(dictionaryResult) },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: Parameters<JwtAuthGuard['canActivate']>[0]) => {
          const req = ctx.switchToHttp().getRequest();
          req.actor = actor;
          return true;
        },
      })
      .overrideGuard(RequireAdminRoleGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ScopesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CompanyScopeGuard)
      .useValue({
        canActivate: (ctx: Parameters<CompanyScopeGuard['canActivate']>[0]) => {
          const req = ctx.switchToHttp().getRequest();
          req.actor = actor;
          req.companyId = actor.companyId;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns taxonomy dictionary payload', async () => {
    await request(app.getHttpServer())
      .get('/companies/company-1/taxonomy/dictionary')
      .expect(200)
      .expect({ hvac: ['cooling'] });
  });
});
