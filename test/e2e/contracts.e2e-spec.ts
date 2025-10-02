import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/modules/auth/jwt.guard';
import { asActor, IDs } from './utils/auth-actor';
import { seedContractsFixture } from './fixtures/contracts.seed';
import { TOKENS as ROUTING_TOKENS } from '../../src/modules/routing/domain/ports';
import { RequireAdminRoleGuard } from '../../src/modules/auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../src/modules/auth/guards/require-admin-scope.guard';
import { ScopesGuard } from '../../src/modules/auth/guards/scopes.guard';

describe('[E2E] Palier 2 — Contracts (version & couverture)', () => {
  let app: INestApplication;
  let contractId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          const actorRaw = req.headers['x-actor'] as string | undefined;
          req.user = actorRaw ? JSON.parse(actorRaw) : null;
          req.actor = req.user;
          return true;
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
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    await seedContractsFixture(app); // crée Company A & Site A1
  });

  afterAll(async () => {
    await app.close();
  });

  it('Create Contract (timestamps absents)', async () => {
    const res = await request(app.getHttpServer())
      .post('/contracts')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({
        siteId: IDs.siteA1,
        name: 'CA - Facilities',
        providerCompanyId: null,
      })
      .expect(201);

    contractId = res.body.id;
    expect(res.body.siteId).toBe(IDs.siteA1);
    expect(res.body.active).toBe(true);

    expect('createdAt' in res.body || 'created_at' in res.body).toBe(false);
    expect('updatedAt' in res.body || 'updated_at' in res.body).toBe(false);
  });

  it('Create ContractVersion v1 puis v1 bis → 409 (UNIQUE(contract_id, version))', async () => {
    const v1 = await request(app.getHttpServer())
      .post('/contracts/versions')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({
        contractId,
        version: 1,
        coverage: { timeWindows: ['business_hours'] },
      })
      .expect(201);

    const hasCreated = 'createdAt' in v1.body || 'created_at' in v1.body;
    const hasUpdated = 'updatedAt' in v1.body || 'updated_at' in v1.body;
    expect(hasCreated).toBe(true);
    expect(hasUpdated).toBe(false);

    await request(app.getHttpServer())
      .post('/contracts/versions')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({
        contractId,
        version: 1,
        coverage: { timeWindows: ['business_hours'] },
      })
      .expect(409);
  });

  it('List ContractVersions renvoie une seule v1', async () => {
    const list = await request(app.getHttpServer())
      .get('/contracts/versions?contractId=' + contractId)
      .set('x-actor', asActor('companyA_adminAll'))
      .expect(200);

    expect(Array.isArray(list.body)).toBe(true);
    const versions = list.body.filter((v: any) => v.version === 1);
    expect(versions.length).toBe(1);
  });
});

