import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RoutingModule } from '../routing.module';
import { RoutingController } from '../infra/routing.controller';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { TOKENS } from '../domain/ports';
import type { RoutingRule as DomainRoutingRule } from '../domain/entities/RoutingRule';

class InMemoryRepo {
  private data: DomainRoutingRule[] = [];
  async create(input: Omit<DomainRoutingRule, 'id'>): Promise<DomainRoutingRule> {
    const id = `r-${this.data.length + 1}`;
    const rec = { ...input, id } as DomainRoutingRule;
    this.data.push(rec);
    return rec;
  }
  async update(id: string, patch: any) {
    const idx = this.data.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error('not found');
    this.data[idx] = { ...this.data[idx], ...patch };
    return this.data[idx];
  }
  async deleteById(id: string) {
    this.data = this.data.filter((r) => r.id !== id);
  }
  async findById(id: string) {
    return this.data.find((r) => r.id === id) ?? null;
  }
  async listByContractVersion(contractVersionId: string) {
    return this.data
      .filter((r) => r.contractVersionId === contractVersionId)
      .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
  }
}

const actor: AuthenticatedActor = {
  id: 'actor',
  email: 'actor@test.dev',
  role: 'admin',
  companyId: 'company-1',
  scopes: [],
  scopeStrings: ['admin:company'],
  companyScopeIds: ['company-1'],
  siteScopeIds: [],
  buildingScopeIds: [],
  siteId: null,
};

describe('Routing simulate (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RoutingModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (ctx: Parameters<JwtAuthGuard['canActivate']>[0]) => { const req = ctx.switchToHttp().getRequest(); req.actor = actor; return true; } })
      .overrideGuard(RequireAdminRoleGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ScopesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CompanyScopeGuard)
      .useValue({ canActivate: (ctx: Parameters<CompanyScopeGuard['canActivate']>[0]) => { const req = ctx.switchToHttp().getRequest(); req.actor = actor; req.companyId = actor.companyId; return true; } })
      // Override repository and queries
      .overrideProvider(TOKENS.RoutingRuleRepository)
      .useClass(InMemoryRepo)
      .overrideProvider(TOKENS.ContractQuery)
      .useValue({ getContractVersion: async (id: string) => ({ id, companyId: 'company-1', siteId: 'site-1', contractId: 'c' }) })
      .overrideProvider(TOKENS.ContractCategoryQuery)
      .useValue({ isCategoryIncluded: async () => true })
      .overrideProvider(TOKENS.CompetencyQuery)
      .useValue({ eligibleTeams: async () => ['team-1'] })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('simulate assigns vendor when rule matches', async () => {
    // create a rule
    await request(app.getHttpServer())
      .post('/companies/company-1/routing/rules')
      .send({
        contractVersionId: '00000000-0000-0000-0000-00000000c001',
        priority: 10,
        condition: { categoryId: '00000000-0000-0000-0000-00000000a001', timeWindow: 'business' },
        action: { assign: { type: 'vendor', externalVendorId: '00000000-0000-0000-0000-000000000009' } },
      })
      .expect(201);

    // simulate
    const res = await request(app.getHttpServer())
      .post('/companies/company-1/routing/simulate')
      .send({
        companyId: 'company-1',
        siteId: 'site-1',
        contractVersionId: '00000000-0000-0000-0000-00000000c001',
        categoryId: '00000000-0000-0000-0000-00000000a001',
        timeWindow: 'business',
      })
      .expect(201);

    expect(res.body.outcome.kind).toBe('ASSIGNED');
    expect(res.body.outcome.assigneeType).toBe('vendor');
    expect(res.body.outcome.assigneeId).toBe('00000000-0000-0000-0000-000000000009');
  });
});
