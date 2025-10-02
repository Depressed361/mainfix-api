import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/modules/auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../src/modules/auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../src/modules/auth/guards/require-admin-scope.guard';
import { ScopesGuard } from '../../src/modules/auth/guards/scopes.guard';
import { TOKENS as ROUTING_TOKENS } from '../../src/modules/routing/domain/ports';
import { asActor } from './utils/auth-actor';
import { seedContractsFixture } from './fixtures/contracts.seed';

const SLA_VALID = {
  P1: { ackMinutes: 15, resolveHours: 4 },
  P2: { ackMinutes: 60, resolveHours: 24 },
  P3: { ackMinutes: 240, resolveHours: 72 },
};

describe('[E2E] Palier 2 — ContractCategory (include + SLA typé)', () => {
  let app: INestApplication;
  let contractId: string;
  let contractVersionId: string;

  let catA1: string;
  let catA2: string;
  let catB1: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (ctx: any) => { const req = ctx.switchToHttp().getRequest(); const actorRaw = req.headers['x-actor'] as string | undefined; const actor = actorRaw ? JSON.parse(actorRaw) : null; req.user = actor; req.actor = actor; return true; } })
      .overrideGuard(RequireAdminRoleGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RequireAdminScopeGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ScopesGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(ROUTING_TOKENS.RoutingRuleRepository)
      .useValue({ create: async () => ({ id: 'r-1' }), update: async () => ({ id: 'r-1' }), deleteById: async () => {}, findById: async () => null, listByContractVersion: async () => [] })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const seed = await seedContractsFixture(app);
    // Isolate this test: create a dedicated Contract and Version to avoid cross-suite pollution
    const uniq = Math.random().toString(36).slice(2,7);
    const cRes = await request(app.getHttpServer())
      .post('/contracts')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ siteId: (seed as any).siteA1 ?? '00000000-0000-0000-0000-0000000000a2', name: `CC-${uniq}`, providerCompanyId: null })
      .expect(201);
    contractId = cRes.body.id;
    const v1 = await request(app.getHttpServer())
      .post('/contracts/versions')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractId, version: 1, coverage: { timeWindows: ['business_hours'] } })
      .expect(201);
    contractVersionId = v1.body.id;

    const hvacKey = `hvac-${Math.random().toString(36).slice(2,7)}`;
    const c1 = await request(app.getHttpServer())
      .post('/taxonomy/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ key: hvacKey, label: 'HVAC' })
      .expect((res) => [201,409].includes(res.status));
    if (c1.status === 201) catA1 = c1.body.id; else {
      const list = await request(app.getHttpServer())
        .get('/taxonomy/categories')
        .set('x-actor', asActor('companyA_adminAll'))
        .expect(200);
      catA1 = list.body.find((x: any) => x.key === hvacKey)?.id;
    }

    const plumbingKey = `plumbing-${Math.random().toString(36).slice(2,7)}`;
    const c2 = await request(app.getHttpServer())
      .post('/taxonomy/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ key: plumbingKey, label: 'Plumbing' })
      .expect((res) => [201,409].includes(res.status));
    if (c2.status === 201) catA2 = c2.body.id; else {
      const list = await request(app.getHttpServer())
        .get('/taxonomy/categories')
        .set('x-actor', asActor('companyA_adminAll'))
        .expect(200);
      catA2 = list.body.find((x: any) => x.key === plumbingKey)?.id;
    }

    const cB = await request(app.getHttpServer())
      .post('/taxonomy/categories')
      .set('x-actor', asActor('companyB_adminAll'))
      .send({ key: 'electrical', label: 'Electrical' })
      .expect((res) => [201,409].includes(res.status));
    if (cB.status === 201) catB1 = cB.body.id; else {
      const listB = await request(app.getHttpServer())
        .get('/taxonomy/categories')
        .set('x-actor', asActor('companyB_adminAll'))
        .expect(200);
      catB1 = listB.body.find((x: any) => x.key === 'electrical')?.id;
    }
  });

  afterAll(async () => { await app.close(); });

  it('Upsert 2 ContractCategory avec SLA typé → OK (timestamps absents)', async () => {
    const r1 = await request(app.getHttpServer())
      .put('/contracts/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId: catA1, included: true, sla: SLA_VALID });
    expect([200,201]).toContain(r1.status);
    expect(r1.body.contractVersionId).toBe(contractVersionId);
    expect(r1.body.categoryId).toBe(catA1);
    expect(r1.body.included).toBe(true);
    expect('createdAt' in r1.body || 'updatedAt' in r1.body || 'created_at' in r1.body || 'updated_at' in r1.body).toBe(false);

    const r2 = await request(app.getHttpServer())
      .put('/contracts/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId: catA2, included: true, sla: SLA_VALID });
    expect([200,201]).toContain(r2.status);
  });

  it('Re-upsert (même pair) → idempotent (200/204), pas de doublon en lecture', async () => {
    const again = await request(app.getHttpServer())
      .put('/contracts/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId: catA1, included: true, sla: SLA_VALID });
    expect([200,204]).toContain(again.status);

    const list = await request(app.getHttpServer())
      .get('/contracts/categories?contractVersionId=' + contractVersionId)
      .set('x-actor', asActor('companyA_adminAll'))
      .expect(200);
    const onlyA1 = list.body.filter((x: any) => x.categoryId === catA1);
    expect(onlyA1.length).toBe(1);
  });

  it('GET liste → exactement 2 catégories pour la version', async () => {
    const list = await request(app.getHttpServer())
      .get('/contracts/categories?contractVersionId=' + contractVersionId)
      .set('x-actor', asActor('companyA_adminAll'))
      .expect(200);
    const ids = new Set(list.body.map((x: any) => x.categoryId));
    expect(ids.has(catA1)).toBe(true);
    expect(ids.has(catA2)).toBe(true);
    expect(list.body.length).toBe(2);
  });

  it('SLA invalide → 422', async () => {
    await request(app.getHttpServer())
      .put('/contracts/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId: catA1, included: true, sla: { P1: { ackMinutes: 15, resolveHours: 4 }, P2: { ackMinutes: 60, resolveHours: 24 } } })
      .expect(422);

    await request(app.getHttpServer())
      .put('/contracts/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId: catA1, included: true, sla: { P1: { ackMinutes: '15' as any, resolveHours: 4 }, P2: { ackMinutes: 60, resolveHours: 24 }, P3: { ackMinutes: 240, resolveHours: 72 } } })
      .expect(422);
  });

  it('Cross-company interdit → 403/422', async () => {
    const res = await request(app.getHttpServer())
      .put('/contracts/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId: catB1, included: true, sla: SLA_VALID });
    expect([403,422]).toContain(res.status);
  });

  it('Toggle included=false met à jour', async () => {
    const r = await request(app.getHttpServer())
      .put('/contracts/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId: catA2, included: false, sla: SLA_VALID });
    expect([200,204]).toContain(r.status);
    const list = await request(app.getHttpServer())
      .get('/contracts/categories?contractVersionId=' + contractVersionId)
      .set('x-actor', asActor('companyA_adminAll'))
      .expect(200);
    const rowA2 = list.body.find((x: any) => x.categoryId === catA2);
    expect(rowA2).toBeTruthy();
    expect(rowA2.included).toBe(false);
  });
});
