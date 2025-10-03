import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/modules/auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../src/modules/auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../src/modules/auth/guards/require-admin-scope.guard';
import { ScopesGuard } from '../../src/modules/auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../src/modules/auth/guards/company-scope.guard';
import { asActor, IDs } from './utils/auth-actor';
import { seedCompetencyMatrixFixture } from './fixtures/competency-matrix.seed';
import { CompetencyMatrix } from '../../src/modules/competency/models/competency-matrix.model';
import { TOKENS as ROUTING_TOKENS } from '../../src/modules/routing/domain/ports';
import { TOKENS as COMP_TOKENS } from '../../src/modules/competency/domain/ports';

describe('[E2E] Palier 3 — CompetencyMatrix (upsert + logique métier)', () => {
  let app: INestApplication;
  let contractVersionId: string;
  let teamId: string;
  let categoryId: string;
  let buildingId: string;
  let skillRequiredId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          const actorRaw = req.headers['x-actor'] as string | undefined;
          const actor = actorRaw ? JSON.parse(actorRaw) : null;
          req.user = actor;
          req.actor = actor;
          return true;
        },
      })
      .overrideGuard(RequireAdminRoleGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RequireAdminScopeGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ScopesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CompanyScopeGuard)
      .useValue({ canActivate: () => true })
      // Ensure company scope consistency for competency use-cases
      .overrideProvider(COMP_TOKENS.ContractQuery)
      .useValue({
        getContractVersionMeta: async (_id: string) => ({
          contractId: 'c',
          siteId: IDs.siteA1,
          companyId: IDs.companyA,
        }),
      })
      .overrideProvider(COMP_TOKENS.CatalogQuery)
      .useValue({
        getBuildingMeta: async (_id: string) => ({
          siteId: IDs.siteA1,
          companyId: IDs.companyA,
        }),
      })
      .overrideProvider(COMP_TOKENS.TeamQuery)
      .useValue({
        getTeamMeta: async (_id: string) => ({
          companyId: IDs.companyA,
          active: true,
        }),
      })
      .overrideProvider(COMP_TOKENS.TaxonomyQuery)
      .useValue({
        requiredSkillsForCategory: async (cid: string) => {
          // Use latest seeded ids via closure
          if (cid === categoryId) return [skillRequiredId];
          return [] as string[];
        },
      })
      // Prevent Routing module repository from requiring DB when not under test
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

    const seed = await seedCompetencyMatrixFixture(app);
    contractVersionId = seed.contractVersionId;
    teamId = seed.teamA1;
    buildingId = seed.buildingA1;
    categoryId = seed.categoryHVAC;
    skillRequiredId = seed.skillBearing;

    // Prepare prerequisites: skills and zone (idempotent)
    await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/team-skills`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ teamId, skillId: skillRequiredId, contractVersionId })
      .expect((res) => [200, 201, 204].includes(res.status));
    await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/team-zones`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ teamId, buildingId, contractVersionId })
      .expect((res) => [200, 201, 204].includes(res.status));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Upsert & unicité', () => {
    it('1) Upsert (global) → 200/201; 2) Upsert identique → 200/204 (idempotent); 3) DB montre une seule ligne', async () => {
      // Ensure required skill exists for primary upsert
      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-skills`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ teamId, skillId: skillRequiredId, contractVersionId })
        .expect((res) => [200, 201, 204].includes(res.status));
      const r1 = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/matrix`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          teamId,
          categoryId,
          level: 'primary',
          window: 'business_hours',
        });
      if (![200, 201].includes(r1.status)) {
        // eslint-disable-next-line no-console
        console.log('DBG upsert-1', r1.status, r1.text);
      }
      expect([200, 201]).toContain(r1.status);
      if (r1.body && typeof r1.body === 'object') {
        expect('createdAt' in r1.body || 'updatedAt' in r1.body || 'created_at' in r1.body || 'updated_at' in r1.body).toBe(false);
      }

      const r2 = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/matrix`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          teamId,
          categoryId,
          level: 'primary',
          window: 'business_hours',
        });
      if (![200, 204].includes(r2.status)) {
        // eslint-disable-next-line no-console
        console.log('DBG upsert-2', r2.status, r2.text);
      }
      expect([200, 204]).toContain(r2.status);

      const rows = await CompetencyMatrix.findAll({
        where: { contractVersionId, teamId, categoryId, buildingId: null, window: 'business_hours' } as any,
      });
      expect(rows.length).toBe(1);
      expect(rows[0].level).toBe('primary');
    });

    it('Changer level sur la même clé → met à jour (policy UPDATE) [VARIANTE A]', async () => {
      const r = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/matrix`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          teamId,
          categoryId,
          level: 'backup',
          window: 'business_hours',
        });
      if (![200, 204].includes(r.status)) {
        // eslint-disable-next-line no-console
        console.log('DBG upsert-change', r.status, r.text);
      }
      expect([200, 204]).toContain(r.status);

      const rows = await CompetencyMatrix.findAll({
        where: { contractVersionId, teamId, categoryId, buildingId: null, window: 'business_hours' } as any,
      });
      expect(rows.length).toBe(1);
      expect(rows[0].level).toBe('backup');
    });

    it('Enums invalides → 422', async () => {
      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/matrix`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          teamId,
          categoryId,
          level: 'chief',
          window: 'business_hours',
        })
        .expect(422);

      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/matrix`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          teamId,
          categoryId,
          level: 'primary',
          window: 'nights',
        })
        .expect(422);
    });
  });

  describe('Logique métier — eligibleTeams', () => {
    it('Préparation: garantir TeamSkills + TeamZones pour l’éligibilité', async () => {
      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-skills`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ teamId, skillId: skillRequiredId, contractVersionId })
        .expect((res) => [200, 201, 204].includes(res.status));

      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-zones`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ teamId, buildingId, contractVersionId })
        .expect((res) => [200, 201, 204].includes(res.status));
    });

    it('business_hours avec ligne globale (building=null) → team éligible', async () => {
      const res = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/eligible-teams`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          categoryId,
          buildingId,
          timeWindow: 'business_hours',
          preferLevel: 'primary',
        })
        .expect(200);
      // eslint-disable-next-line no-console
      if (res.status !== 200) console.log('DBG eligible-1', res.status, res.text);
      expect(res.body).toContain(teamId);
    });

    it('after_hours sans ligne after_hours ni any → team NON éligible', async () => {
      const res2 = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/eligible-teams`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          categoryId,
          buildingId,
          timeWindow: 'after_hours',
          preferLevel: 'primary',
        })
        .expect(200);
      if (res2.status !== 200) console.log('DBG eligible-2', res2.status, res2.text);
      expect(res2.body).not.toContain(teamId);
    });

    it('Ajout d’une ligne ANY → team devient éligible en after_hours', async () => {
      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/matrix`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          teamId,
          categoryId,
          level: 'backup',
          window: 'any',
        })
        .expect((res) => [200, 201, 204].includes(res.status));

      const after = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/eligible-teams`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          categoryId,
          buildingId,
          timeWindow: 'after_hours',
          preferLevel: 'any',
        })
        .expect(200);
      if (after.status !== 200) console.log('DBG eligible-3', after.status, after.text);
      expect(after.body).toContain(teamId);
    });

    it('Ligne building-specific prime sur globale (pas de doublon)', async () => {
      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/matrix`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          teamId,
          categoryId,
          buildingId,
          level: 'primary',
          window: 'business_hours',
        })
        .expect((res) => [200, 201, 204].includes(res.status));

      const res3 = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/eligible-teams`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          categoryId,
          buildingId,
          timeWindow: 'business_hours',
          preferLevel: 'primary',
        })
        .expect(200);
      if (res3.status !== 200) console.log('DBG eligible-4', res3.status, res3.text);

      const seen = res3.body.filter((t: string) => t === teamId).length;
      expect(seen).toBe(1);
    });

    it('Si la team perd la skill requise → non éligible en primary', async () => {
      await request(app.getHttpServer())
        .delete(`/companies/${IDs.companyA}/competency/team-skills/${teamId}/${skillRequiredId}`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ contractVersionId })
        .expect((r) => [200, 204].includes(r.status));

      const res = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/eligible-teams`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          categoryId,
          buildingId,
          timeWindow: 'business_hours',
          preferLevel: 'primary',
        })
        .expect(200);

      expect(res.body).not.toContain(teamId);

      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-skills`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ teamId, skillId: skillRequiredId, contractVersionId })
        .expect((r) => [200, 201, 204].includes(r.status));
    });

    it('Si la team n’est pas zonée sur le building → non éligible', async () => {
      await request(app.getHttpServer())
        .delete(`/companies/${IDs.companyA}/competency/team-zones/${teamId}/${buildingId}`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ contractVersionId })
        .expect((r) => [200, 204].includes(r.status));

      const res4 = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/eligible-teams`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          contractVersionId,
          categoryId,
          buildingId,
          timeWindow: 'business_hours',
          preferLevel: 'primary',
        })
        .expect(200);
      if (res4.status !== 200) console.log('DBG eligible-5', res4.status, res4.text);
      expect(res4.body).not.toContain(teamId);
    });
  });
});
