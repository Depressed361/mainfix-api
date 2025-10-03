import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/modules/auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../src/modules/auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../src/modules/auth/guards/require-admin-scope.guard';
import { ScopesGuard } from '../../src/modules/auth/guards/scopes.guard';
import { asActor, IDs } from './utils/auth-actor';
import { TOKENS as COMP_TOKENS } from '../../src/modules/competency/domain/ports';
import { TOKENS as ROUTING_TOKENS } from '../../src/modules/routing/domain/ports';
import { seedCompetencyBasics } from './fixtures/competency.seed';
import { TeamZone } from '../../src/modules/competency/models/team-zone.model';
import { TeamSkill } from '../../src/modules/competency/models/team-skills.model';

describe('[E2E] Palier 3 — Competency (TeamZones & TeamSkills idempotents)', () => {
  let app: INestApplication;
  let skillA1: string;
  let contractVersionId: string;

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
        getContractVersionMeta: async (_id: string) => ({
          contractId: 'c',
          siteId: IDs.siteA1,
          companyId: IDs.companyA,
          version: 1,
          coverage: {},
          escalation: null,
          approvals: null,
          categories: [],
        }),
      })
      .overrideProvider(COMP_TOKENS.TeamQuery)
      .useValue({
        getTeamMeta: async (_id: string) => ({
          companyId: IDs.companyA,
          active: true,
        }),
      })
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

    await seedCompetencyBasics(app);

    // Create a contract + version 1 to provide contractVersionId required by competency infra
    const c = await request(app.getHttpServer())
      .post('/contracts')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({
        siteId: IDs.siteA1,
        name: 'Comp - Facilities',
        providerCompanyId: null,
      })
      .expect(201);
    const v1 = await request(app.getHttpServer())
      .post('/contracts/versions')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({
        contractId: c.body.id,
        version: 1,
        coverage: { timeWindows: ['business_hours'] },
      })
      .expect(201);
    contractVersionId = v1.body.id;

    // Create skill for company A (idempotent)
    const uniq = Math.random().toString(36).slice(2, 7);
    const s = await request(app.getHttpServer())
      .post('/taxonomy/skills')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ key: `electrical-${uniq}`, label: 'Electrical' })
      .expect((res) => [201, 409].includes(res.status));
    if (s.status === 201) {
      skillA1 = s.body.id;
    } else {
      const list = await request(app.getHttpServer())
        .get('/taxonomy/skills')
        .set('x-actor', asActor('companyA_adminAll'))
        .expect(200);
      skillA1 = list.body.find((x: any) =>
        String(x.key || '').startsWith('electrical-'),
      )?.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('TeamZones (PK composite teamId+buildingId)', () => {
    it('Upsert (teamA1, buildingA1) idempotent', async () => {
      const first = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-zones`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          teamId: IDs.teamA1,
          buildingId: IDs.buildingA1,
          contractVersionId,
        });
      expect([200, 201, 204]).toContain(first.status);

      const second = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-zones`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          teamId: IDs.teamA1,
          buildingId: IDs.buildingA1,
          contractVersionId,
        });
      expect([200, 204]).toContain(second.status);

      const rows = await TeamZone.findAll({
        where: { teamId: IDs.teamA1, buildingId: IDs.buildingA1 } as any,
      });
      expect(rows.length).toBe(1);
    });
  });

  describe('TeamSkills (PK composite teamId+skillId)', () => {
    it('Upsert (teamA1, skillA1) idempotent', async () => {
      const first = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-skills`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ teamId: IDs.teamA1, skillId: skillA1, contractVersionId });
      expect([200, 201, 204]).toContain(first.status);

      const second = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-skills`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ teamId: IDs.teamA1, skillId: skillA1, contractVersionId });
      expect([200, 204]).toContain(second.status);

      const rows = await TeamSkill.findAll({
        where: { teamId: IDs.teamA1, skillId: skillA1 } as any,
      });
      expect(rows.length).toBe(1);
    });
  });

  describe('DELETE then re-upsert', () => {
    it('TeamZone: delete then re-upsert returns a single row', async () => {
      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-zones`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          teamId: IDs.teamA1,
          buildingId: IDs.buildingA1,
          contractVersionId,
        });

      const del = await request(app.getHttpServer())
        .delete(
          `/companies/${IDs.companyA}/competency/team-zones/${IDs.teamA1}/${IDs.buildingA1}`,
        )
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ contractVersionId });
      expect([200, 204]).toContain(del.status);

      const afterDel = await TeamZone.findAll({
        where: { teamId: IDs.teamA1, buildingId: IDs.buildingA1 } as any,
      });
      expect(afterDel.length).toBe(0);

      const reu = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-zones`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({
          teamId: IDs.teamA1,
          buildingId: IDs.buildingA1,
          contractVersionId,
        });
      expect([200, 201, 204]).toContain(reu.status);

      const finalRows = await TeamZone.findAll({
        where: { teamId: IDs.teamA1, buildingId: IDs.buildingA1 } as any,
      });
      expect(finalRows.length).toBe(1);
    });

    it('TeamSkill: delete then re-upsert returns a single row', async () => {
      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-skills`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ teamId: IDs.teamA1, skillId: skillA1, contractVersionId });

      const del = await request(app.getHttpServer())
        .delete(
          `/companies/${IDs.companyA}/competency/team-skills/${IDs.teamA1}/${skillA1}`,
        )
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ contractVersionId });
      expect([200, 204]).toContain(del.status);

      const afterDel = await TeamSkill.findAll({
        where: { teamId: IDs.teamA1, skillId: skillA1 } as any,
      });
      expect(afterDel.length).toBe(0);

      const reu = await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-skills`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ teamId: IDs.teamA1, skillId: skillA1, contractVersionId });
      expect([200, 201, 204]).toContain(reu.status);

      const finalRows = await TeamSkill.findAll({
        where: { teamId: IDs.teamA1, skillId: skillA1 } as any,
      });
      expect(finalRows.length).toBe(1);
    });
  });
});
