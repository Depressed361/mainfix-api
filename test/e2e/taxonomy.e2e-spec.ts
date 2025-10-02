import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TOKENS as ROUTING_TOKENS } from '../../src/modules/routing/domain/ports';
import { JwtAuthGuard } from '../../src/modules/auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../src/modules/auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../src/modules/auth/guards/require-admin-scope.guard';
import { ScopesGuard } from '../../src/modules/auth/guards/scopes.guard';
import { asActor, IDs } from './utils/auth-actor';
import { seedTaxonomyFixture } from './fixtures/taxonomy.seed';

describe('[E2E] Palier 1 — Taxonomy', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          const actorRaw = req.headers['x-actor'] as string | undefined;
          req.user = actorRaw ? JSON.parse(actorRaw) : null;
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
    await seedTaxonomyFixture(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('3) CRUD Category & Skill + Unicité (company, key)', () => {
    it('Create Category in company A → 201; duplicate key in same company → 409', async () => {
      const uniq = Math.random().toString(36).slice(2, 7);
      const keyA = `hvac-${uniq}`;
      const body = { key: keyA, label: 'HVAC' };

      const res1 = await request(app.getHttpServer())
        .post('/taxonomy/categories')
        .set('x-actor', asActor('companyA_adminAll'))
        .send(body)
        .expect(201);

      expect(res1.body).toMatchObject({ key: keyA, label: 'HVAC' });
      expect(res1.body.companyId).toBe(IDs.companyA);
      (global as any).__lastCatKey = keyA;

      await request(app.getHttpServer())
        .post('/taxonomy/categories')
        .set('x-actor', asActor('companyA_adminAll'))
        .send(body)
        .expect(409);
    });

    it('Same category key in another company → allowed (201)', async () => {
      // reuse previous unique key
      const key = (global as any).__lastCatKey as string | undefined;
      const catKey = key || `hvac-${Math.random().toString(36).slice(2,7)}`;
      await request(app.getHttpServer())
        .post('/taxonomy/categories')
        .set('x-actor', asActor('companyB_adminAll'))
        .send({ key: catKey, label: 'HVAC B' })
        .expect(201);
    });

    it('Create Skill in company A; duplicate key same company → 409; other company → 201', async () => {
      const uniq = Math.random().toString(36).slice(2, 7);
      const keyA = `electrical-${uniq}`;
      const bodyA = { key: keyA, label: 'Electrical' };

      await request(app.getHttpServer())
        .post('/taxonomy/skills')
        .set('x-actor', asActor('companyA_adminAll'))
        .send(bodyA)
        .expect(201);

      await request(app.getHttpServer())
        .post('/taxonomy/skills')
        .set('x-actor', asActor('companyA_adminAll'))
        .send(bodyA)
        .expect(409);

      await request(app.getHttpServer())
        .post('/taxonomy/skills')
        .set('x-actor', asActor('companyB_adminAll'))
        .send({ key: keyA, label: 'Electrical B' })
        .expect(201);
    });

    it('List endpoints are company-scoped (no cross-company leakage)', async () => {
      const resA = await request(app.getHttpServer())
        .get('/taxonomy/categories?includeSkills=0')
        .set('x-actor', asActor('companyA_adminAll'))
        .expect(200);
      expect(Array.isArray(resA.body)).toBe(true);
      expect(resA.body.every((c: any) => c.companyId === IDs.companyA)).toBe(true);

      const resB = await request(app.getHttpServer())
        .get('/taxonomy/skills?includeCategories=0')
        .set('x-actor', asActor('companyB_adminAll'))
        .expect(200);
      expect(Array.isArray(resB.body)).toBe(true);
      expect(resB.body.every((s: any) => s.companyId === IDs.companyB)).toBe(true);
    });

    it('PATCH category label (cannot change companyId)', async () => {
      const created = await request(app.getHttpServer())
        .post('/taxonomy/categories')
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ key: `plumbing-${Math.random().toString(36).slice(2,7)}`, label: 'Plumbing' })
        .expect(201);

      const updated = await request(app.getHttpServer())
        .patch(`/taxonomy/categories/${created.body.id}`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ label: 'Plumbing & Pipes' })
        .expect(200);

      expect(updated.body.label).toBe('Plumbing & Pipes');
      expect(updated.body.companyId).toBe(IDs.companyA);
    });
  });

  describe('4) Mapping Category↔Skill (idempotent)', () => {
    let catIdA: string;
    let skillIdA: string;
    let mechKey = `mechanical-${Math.random().toString(36).slice(2,7)}`;
    let bearingKey = `bearing-${Math.random().toString(36).slice(2,7)}`;

    beforeAll(async () => {
      const cat = await request(app.getHttpServer())
        .post('/taxonomy/categories')
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ key: mechKey, label: 'Mechanical' })
        .expect(201);
      catIdA = cat.body.id;

      const skill = await request(app.getHttpServer())
        .post('/taxonomy/skills')
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ key: bearingKey, label: 'Bearing Replacement' })
        .expect(201);
      skillIdA = skill.body.id;
    });

    it('POST mapping twice → 200/204 second time, no duplicates', async () => {
      const first = await request(app.getHttpServer())
        .post('/taxonomy/category-skills')
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ categoryId: catIdA, skillId: skillIdA });
      expect([200, 201, 204]).toContain(first.status);

      const second = await request(app.getHttpServer())
        .post('/taxonomy/category-skills')
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ categoryId: catIdA, skillId: skillIdA });
      expect([200, 204]).toContain(second.status);

      const catWithSkills = await request(app.getHttpServer())
        .get('/taxonomy/categories?includeSkills=1')
        .set('x-actor', asActor('companyA_adminAll'))
        .expect(200);

      const mech = catWithSkills.body.find((c: any) => c.id === catIdA);
      expect(mech).toBeTruthy();
      const linked = (mech.skills || []).filter((s: any) => s.id === skillIdA);
      expect(linked.length).toBe(1);
    });

    it('Mapping cross-company interdit (403/422)', async () => {
      const skillB = await request(app.getHttpServer())
        .post('/taxonomy/skills')
        .set('x-actor', asActor('companyB_adminAll'))
        .send({ key: bearingKey, label: 'Bearing B' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/taxonomy/category-skills')
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ categoryId: catIdA, skillId: skillB.body.id });
      expect([403, 422]).toContain(res.status);
    });

    it('DELETE mapping retire l’association', async () => {
      await request(app.getHttpServer())
        .delete(`/taxonomy/category-skills/${catIdA}/${skillIdA}`)
        .set('x-actor', asActor('companyA_adminAll'))
        .expect(204);

      const catWithSkills = await request(app.getHttpServer())
        .get('/taxonomy/categories?includeSkills=1')
        .set('x-actor', asActor('companyA_adminAll'))
        .expect(200);

      const mech = catWithSkills.body.find((c: any) => c.id === catIdA);
      const linked = (mech?.skills || []).filter((s: any) => s.id === skillIdA);
      expect(linked.length).toBe(0);
    });
  });
});
