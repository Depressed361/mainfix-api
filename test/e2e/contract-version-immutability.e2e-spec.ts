import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/modules/auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../src/modules/auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../src/modules/auth/guards/require-admin-scope.guard';
import { ScopesGuard } from '../../src/modules/auth/guards/scopes.guard';
import { TOKENS as ROUTING_TOKENS } from '../../src/modules/routing/domain/ports';
import { asActor, IDs } from './utils/auth-actor';
import { TOKENS as TICKETS_TOKENS } from '../../src/modules/tickets/domain/ports';
import { Company } from '../../src/modules/companies/company.model';
import { Site } from '../../src/modules/catalog/models/site.model';
import { Building } from '../../src/modules/catalog/models/buildings.model';
// Ticket model not needed anymore (no direct DB insert fallback)

const SLA_VALID = {
  P1: { ackMinutes: 15, resolveHours: 4 },
  P2: { ackMinutes: 60, resolveHours: 24 },
  P3: { ackMinutes: 240, resolveHours: 72 },
};


describe('[E2E] Palier 2 — ContractVersion immuable si référencée', () => {
  let app: INestApplication;
  let contractId: string;
  let contractVersionId: string;
  let categoryId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          const actorRaw = req.headers['x-actor'] as string | undefined;
          const actor = actorRaw ? JSON.parse(actorRaw) : null;
          req.user = actor; req.actor = actor; return true;
        },
      })
      .overrideGuard(RequireAdminRoleGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RequireAdminScopeGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ScopesGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(ROUTING_TOKENS.RoutingRuleRepository)
      .useValue({
        create: async (..._args: any[]) => ({ id: 'r-1' }),
        update: async (..._args: any[]) => ({ id: 'r-1' }),
        deleteById: async () => {},
        findById: async () => null,
        listByContractVersion: async () => [],
      })
      // Stub DirectoryQuery for ticket creation to avoid depending on seeded users
      .overrideProvider(TICKETS_TOKENS.DirectoryQuery)
      .useValue({
        getUserMeta: async (_uid: string) => ({ companyId: IDs.companyA, role: 'admin', active: true }),
        isUserInTeam: async () => true,
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Seed minimal: Company/Site/Building via models (no direct SEQUELIZE token)
    await Company.upsert({ id: IDs.companyA, name: 'Company A' } as any);
    await Site.upsert({ id: IDs.siteA1, companyId: IDs.companyA, code: 'A1', name: 'Site A1', timezone: 'Europe/Paris' } as any);
    await Building.upsert({ id: IDs.buildingA1, siteId: IDs.siteA1, code: 'BA1', name: 'A1' } as any);

    const c = await request(app.getHttpServer())
      .post('/contracts')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ siteId: IDs.siteA1, name: 'CA - Facilities', providerCompanyId: null })
      .expect(201);
    contractId = c.body.id;

    const v1 = await request(app.getHttpServer())
      .post('/contracts/versions')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractId, version: 1, coverage: { timeWindows: ['business_hours'] } })
      .expect(201);
    contractVersionId = v1.body.id;

    const hvacKey = `hvac-${Math.random().toString(36).slice(2,7)}`;
    const cat = await request(app.getHttpServer())
      .post('/taxonomy/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ key: hvacKey, label: 'HVAC' })
      .expect((res) => [201,409].includes(res.status));
    if (cat.status === 201) categoryId = cat.body.id; else {
      const list = await request(app.getHttpServer())
        .get('/taxonomy/categories')
        .set('x-actor', asActor('companyA_adminAll'))
        .expect(200);
      categoryId = list.body.find((x: any) => x.key === hvacKey)?.id;
    }

    // Sanity: category resolved belongs to Company A (cross-company safe)
    const catCheck = await request(app.getHttpServer())
      .get('/taxonomy/categories?includeSkills=0')
      .set('x-actor', asActor('companyA_adminAll'))
      .expect(200);
    const catByKey = catCheck.body.find((c: any) => c.key === hvacKey);
    expect(catByKey).toBeTruthy();
    expect(catByKey.companyId).toBe(IDs.companyA);
    // Also ensure the resolved id matches the key result to avoid cross-tenant mismatch
    expect(catByKey.id).toBe(categoryId);

    await request(app.getHttpServer())
      .put('/contracts/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId, included: true, sla: SLA_VALID });

    // assert inclusion before creating ticket (micro-retry once for DB latency)
    let cats = await request(app.getHttpServer())
      .get('/contracts/categories?contractVersionId=' + contractVersionId)
      .set('x-actor', asActor('companyA_adminAll'))
      .expect(200);
    let includedRow = cats.body.find((r: any) => r.categoryId === categoryId);
    if (!includedRow || includedRow.included !== true) {
      await new Promise((r) => setTimeout(r, 120));
      cats = await request(app.getHttpServer())
        .get('/contracts/categories?contractVersionId=' + contractVersionId)
        .set('x-actor', asActor('companyA_adminAll'))
        .expect(200);
      includedRow = cats.body.find((r: any) => r.categoryId === categoryId);
    }
    if (!includedRow || includedRow.included !== true) {
      throw new Error('Category not included for this ContractVersion — aborting POST /tickets');
    }

    const ticketCreate = await request(app.getHttpServer())
      .post('/tickets')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ siteId: IDs.siteA1, buildingId: IDs.buildingA1, categoryId, title: 'Clim HS', description: 'Plus d\'air froid', priority: 'P2', contractVersionId });
    expect([200, 201]).toContain(ticketCreate.status);
  });

  afterAll(async () => { await app.close(); });

  it('PATCH /contracts/versions/:id sur coverage après référence → 409', async () => {
    await request(app.getHttpServer())
      .patch('/contracts/versions/' + contractVersionId)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ coverage: { timeWindows: ['after_hours'] } })
      .expect(409);
  });

  it('Lecture inchangée: GET versions renvoie toujours v1 intacte', async () => {
    const list = await request(app.getHttpServer())
      .get('/contracts/versions?contractId=' + contractId)
      .set('x-actor', asActor('companyA_adminAll'))
      .expect(200);
    const v1 = list.body.find((v: any) => v.version === 1);
    expect(v1).toBeTruthy();
    expect(v1.coverage?.timeWindows).toEqual(['business_hours']);
  });
});
