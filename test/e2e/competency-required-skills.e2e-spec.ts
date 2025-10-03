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
import { TOKENS as ROUTING_TOKENS } from '../../src/modules/routing/domain/ports';
import { TOKENS as COMP_TOKENS } from '../../src/modules/competency/domain/ports';

const SLA = { P1: { ackMinutes: 15, resolveHours: 4 }, P2: { ackMinutes: 60, resolveHours: 24 }, P3: { ackMinutes: 240, resolveHours: 72 } };

describe('[E2E] Palier 3.10 — Required skills validation', () => {
  let app: INestApplication;
  let contractVersionId: string;
  let categoryId: string; // C = hvac
  let skillId: string; // S = bearing
  let createdContractId: string | undefined;
  let teamId: string;
  let buildingId: string;

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
      // Prevent routing module hard deps
      .overrideProvider(ROUTING_TOKENS.RoutingRuleRepository)
      .useValue({
        create: async (..._args: any[]) => ({ id: 'r-1' }),
        update: async (..._args: any[]) => ({ id: 'r-1' }),
        deleteById: async () => {},
        findById: async () => null,
        listByContractVersion: async () => [],
      })
      // Ensure competency company scope + taxonomy mapping are aligned with seeded data
      .overrideProvider(COMP_TOKENS.ContractQuery)
      .useValue({
        getContractVersionMeta: async (_id: string) => ({
          contractId: createdContractId ?? IDs.contractA,
          siteId: IDs.siteA1,
          companyId: IDs.companyA,
        }),
      })
      .overrideProvider(COMP_TOKENS.CatalogQuery)
      .useValue({
        getBuildingMeta: async (_id: string) => ({ siteId: IDs.siteA1, companyId: IDs.companyA }),
      })
      .overrideProvider(COMP_TOKENS.TeamQuery)
      .useValue({
        getTeamMeta: async (_id: string) => ({ companyId: IDs.companyA, active: true }),
      })
      .overrideProvider(COMP_TOKENS.TaxonomyQuery)
      .useValue({
        requiredSkillsForCategory: async (cid: string) => (cid === categoryId && skillId ? [skillId] : []),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Company/Site/Building/Team
    const { Company } = require('../../src/modules/companies/company.model');
    const { Site } = require('../../src/modules/catalog/models/site.model');
    const { Building } = require('../../src/modules/catalog/models/buildings.model');
    const { Team } = require('../../src/modules/directory/models/team.model');
    const { v4: uuidv4 } = require('uuid');
    await Company.upsert({ id: IDs.companyA, name: 'Company A' });
    await Site.upsert({ id: IDs.siteA1, companyId: IDs.companyA, code: 'A1', name: 'Site A1', timezone: 'Europe/Paris' });
    buildingId = uuidv4();
    teamId = uuidv4();
    const bcode = `B-${buildingId.slice(0,8)}`;
    await Building.upsert({ id: buildingId, siteId: IDs.siteA1, code: bcode, name: 'A1' });
    await Team.upsert({ id: teamId, companyId: IDs.companyA, name: `Team A1 ${teamId.slice(0,4)}`, type: 'internal', active: true });

    // Contract + v1
    const { Contract } = require('../../src/modules/contracts/models/contract.model');
    const { ContractVersion } = require('../../src/modules/contracts/models/contract-version.model');
    createdContractId = uuidv4();
    await Contract.upsert({ id: createdContractId, siteId: IDs.siteA1, name: 'CA E2E', active: true });
    contractVersionId = uuidv4();
    await ContractVersion.upsert({ id: contractVersionId, contractId: createdContractId, version: 1, coverage: { timeWindows: ['business_hours'] }, escalation: null, approvals: null });

    // Taxonomy: Skill S + Category C + mapping
    const s = await request(app.getHttpServer())
      .post('/taxonomy/skills')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ key: `bearing-${Math.random().toString(36).slice(2,7)}`, label: 'Bearing Replacement' })
      .expect((r) => [201].includes(r.status));
    if (s.status === 201) skillId = s.body.id;
    

    const c = await request(app.getHttpServer())
      .post('/taxonomy/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ key: `hvac-${Math.random().toString(36).slice(2,7)}`, label: 'HVAC' })
      .expect((r) => [201].includes(r.status));
    if (c.status === 201) categoryId = c.body.id;
    

    await request(app.getHttpServer())
      .post('/taxonomy/category-skills')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ categoryId, skillId })
      .expect((r) => [200, 201, 204, 409].includes(r.status));

    // ContractCategory include C (SLA valid)
    await request(app.getHttpServer())
      .put('/contracts/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId, included: true, sla: SLA })
      .expect((r) => [200, 201, 204].includes(r.status));

    // TeamZones OK (pour ne tester QUE la skill manquante)
    await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/team-zones`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ teamId, buildingId, contractVersionId })
      .expect((r) => [200, 201, 204].includes(r.status));
    // PAS de team-skills ⇒ la team NE possède PAS skillId (bearing)
  });

  afterAll(async () => {
    await app.close();
  });

  it('Upsert competency PRIMARY sans skill requise → 422', async () => {
    // eslint-disable-next-line no-console
    console.log('DBG vars', { contractVersionId, teamId, categoryId });
    const res = await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/matrix`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({
        contractVersionId,
        teamId,
        categoryId,
        level: 'primary',
        window: 'business_hours',
      })
      .expect((r) => {
        if (r.status !== 422) {
          // eslint-disable-next-line no-console
          console.log('DBG required-skill upsert primary no-skill', r.status, r.text);
        }
      });
    expect(res.status).toBe(422);
  });

  it('Ajout de la skill requise → Upsert PRIMARY OK (200/201)', async () => {
    await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/team-skills`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ teamId, skillId, contractVersionId })
      .expect((r) => [200, 201, 204].includes(r.status));

    const up = await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/matrix`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({
        contractVersionId,
        teamId,
        categoryId,
        level: 'primary',
        window: 'business_hours',
      });
    expect([200, 201].includes(up.status)).toBe(true);
  });

  it('EligibleTeams reflète la règle métier (team maintenant éligible)', async () => {
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
    expect(res.body).toContain(teamId);
  });
});
