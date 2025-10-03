import { INestApplication } from '@nestjs/common';
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

describe('[E2E] Palier 3.11 — EligibleTeams API', () => {
  let app: INestApplication;
  let contractVersionId: string;
  let contractId: string;
  let categoryId: string; // hvac
  let skillId: string; // bearing
  const buildingId = IDs.buildingA1;
  const teamA1 = IDs.teamA1;
  let teamA2: string;
  let teamA3: string;

  const SLA = { P1: { ackMinutes: 15, resolveHours: 4 }, P2: { ackMinutes: 60, resolveHours: 24 }, P3: { ackMinutes: 240, resolveHours: 72 } };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: (ctx: any) => { const req = ctx.switchToHttp().getRequest(); const actorRaw = req.headers['x-actor'] as string | undefined; const actor = actorRaw ? JSON.parse(actorRaw) : null; req.user = actor; req.actor = actor; return true; } })
      .overrideGuard(RequireAdminRoleGuard).useValue({ canActivate: () => true })
      .overrideGuard(RequireAdminScopeGuard).useValue({ canActivate: () => true })
      .overrideGuard(ScopesGuard).useValue({ canActivate: () => true })
      .overrideGuard(CompanyScopeGuard).useValue({ canActivate: () => true })
      .overrideProvider(ROUTING_TOKENS.RoutingRuleRepository)
      .useValue({ create: async () => ({ id: 'r-1' }), update: async () => ({ id: 'r-1' }), deleteById: async () => {}, findById: async () => null, listByContractVersion: async () => [] })
      // Align competency scope with seeded data
      .overrideProvider(require('../../src/modules/competency/domain/ports').TOKENS.ContractQuery)
      .useValue({
        getContractVersionMeta: async (id: string) => {
          const { ContractVersion } = require('../../src/modules/contracts/models/contract-version.model');
          const { Contract } = require('../../src/modules/contracts/models/contract.model');
          const { Site } = require('../../src/modules/catalog/models/site.model');
          const v = await ContractVersion.findByPk(id);
          if (!v) return { contractId: 'c', siteId: IDs.siteA1, companyId: IDs.companyA };
          const c = await Contract.findByPk(v.contractId);
          const s = c ? await Site.findByPk(c.siteId) : null;
          const companyId = s ? s.companyId : IDs.companyA;
          return { contractId: v.contractId, siteId: c?.siteId ?? IDs.siteA1, companyId };
        },
      })
      .overrideProvider(require('../../src/modules/competency/domain/ports').TOKENS.CatalogQuery)
      .useValue({
        getBuildingMeta: async (id: string) => {
          const { Building } = require('../../src/modules/catalog/models/buildings.model');
          const { Site } = require('../../src/modules/catalog/models/site.model');
          const b = await Building.findByPk(id);
          const s = b ? await Site.findByPk(b.siteId) : null;
          return { siteId: s?.id ?? IDs.siteA1, companyId: s?.companyId ?? IDs.companyA };
        },
      })
      .overrideProvider(require('../../src/modules/competency/domain/ports').TOKENS.TeamQuery)
      .useValue({
        getTeamMeta: async (id: string) => {
          const { Team } = require('../../src/modules/directory/models/team.model');
          const t = await Team.findByPk(id);
          return { companyId: t?.companyId ?? IDs.companyA, active: !!t?.active };
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Sequelize models (for direct upsert of base refs)
    const { Company } = require('../../src/modules/companies/company.model');
    const { Site } = require('../../src/modules/catalog/models/site.model');
    const { Building } = require('../../src/modules/catalog/models/buildings.model');
    const { Team } = require('../../src/modules/directory/models/team.model');
    const { Contract } = require('../../src/modules/contracts/models/contract.model');
    const { ContractVersion } = require('../../src/modules/contracts/models/contract-version.model');
    const { v4: uuidv4 } = require('uuid');

    // --- Seed Company/Site/Building/Teams ---
    await Company.upsert({ id: IDs.companyA, name: 'Company A' });
    await Site.upsert({ id: IDs.siteA1, companyId: IDs.companyA, code: 'A1', name: 'Site A1', timezone: 'Europe/Paris' });
    await Building.upsert({ id: buildingId, siteId: IDs.siteA1, code: 'BA1', name: 'A1' });

    teamA2 = uuidv4();
    teamA3 = uuidv4();
    await Team.upsert({ id: teamA1, companyId: IDs.companyA, name: 'Team A1', type: 'internal', active: true });
    await Team.upsert({ id: teamA2, companyId: IDs.companyA, name: 'Team A2', type: 'internal', active: true });
    await Team.upsert({ id: teamA3, companyId: IDs.companyA, name: 'Team A3', type: 'internal', active: true });

    // --- Contract + Version v1 ---
    contractId = uuidv4();
    await Contract.upsert({ id: contractId, siteId: IDs.siteA1, name: 'CA', active: true });
    contractVersionId = uuidv4();
    await ContractVersion.upsert({ id: contractVersionId, contractId, version: 1, coverage: { timeWindows: ['business_hours'] }, escalation: null, approvals: null });

    // --- Taxonomy: Skill S + Category C + mapping ---
    const s = await request(app.getHttpServer())
      .post('/taxonomy/skills').set('x-actor', asActor('companyA_adminAll'))
      .send({ key: `bearing-${Math.random().toString(36).slice(2,7)}`, label: 'Bearing Replacement' })
      .expect(201);
    skillId = s.body.id;

    const c = await request(app.getHttpServer())
      .post('/taxonomy/categories').set('x-actor', asActor('companyA_adminAll'))
      .send({ key: `hvac-${Math.random().toString(36).slice(2,7)}`, label: 'HVAC' })
      .expect(201);
    categoryId = c.body.id;

    await request(app.getHttpServer())
      .post('/taxonomy/category-skills')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ categoryId, skillId })
      .expect((r) => [200,201,204].includes(r.status));

    // --- ContractCategory include C (SLA valid) ---
    await request(app.getHttpServer())
      .put('/contracts/categories')
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId, included: true, sla: SLA })
      .expect((r) => [200,201,204].includes(r.status));

    // --- TeamZones: tous sur building A1 ---
    for (const t of [teamA1, teamA2, teamA3]) {
      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-zones`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ teamId: t, buildingId, contractVersionId })
        .expect((r) => [200,201,204].includes(r.status));
    }

    // --- TeamSkills: tous ont S ---
    for (const t of [teamA1, teamA2, teamA3]) {
      await request(app.getHttpServer())
        .post(`/companies/${IDs.companyA}/competency/team-skills`)
        .set('x-actor', asActor('companyA_adminAll'))
        .send({ teamId: t, skillId, contractVersionId })
        .expect((r) => [200,201,204].includes(r.status));
    }

    // --- CompetencyMatrix lignes de base ---
    // A1: business_hours (global)
    await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/matrix`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, teamId: teamA1, categoryId, level: 'primary', window: 'business_hours' })
      .expect((r) => { if (![200,201,204].includes(r.status)) { console.log('DBG upsert A1 bh', r.status, r.text); } });

    // A2: after_hours (global) => doit être exclue pour business_hours
    await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/matrix`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, teamId: teamA2, categoryId, level: 'primary', window: 'after_hours' })
      .expect((r) => { if (![200,201,204].includes(r.status)) { console.log('DBG upsert A2 ah', r.status, r.text); } });

    // A3: any (global) => doit être incluse pour business_hours
    await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/matrix`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, teamId: teamA3, categoryId, level: 'backup', window: 'any' })
      .expect((r) => { if (![200,201,204].includes(r.status)) { console.log('DBG upsert A3 any', r.status, r.text); } });

    // Debug: list matrix rows via public controller
    const list = await request(app.getHttpServer())
      .get(`/contracts/${contractId}/versions/1/competencies`)
      .set('x-actor', asActor('companyA_adminAll'))
      .expect(200);
    console.log('DBG matrix-list count', Array.isArray(list.body) ? list.body.length : 'n/a');
    if (!Array.isArray(list.body) || list.body.length === 0) { console.log('DBG matrix-list empty', list.text); }

    const resolved = await request(app.getHttpServer())
      .get(`/contracts/${contractId}/versions/1/competencies/resolve`)
      .query({ categoryId, buildingId, window: 'business_hours' })
      .set('x-actor', asActor('companyA_adminAll'))
      .expect(200);
    console.log('DBG service-resolve count', Array.isArray(resolved.body) ? resolved.body.length : 'n/a');
  });

  afterAll(async () => { await app.close(); });

  it('Cas 1 — business_hours: retourne uniquement ANY + BUSINESS_HOURS', async () => {
    const res = await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/eligible-teams`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId, buildingId, timeWindow: 'business_hours', preferLevel: 'any' })
      .expect(200);
    if (!Array.isArray(res.body) || res.body.length === 0) { console.log('DBG eligible-1 empty', res.text); }
    expect(res.body).toEqual(expect.arrayContaining([teamA1, teamA3]));
    expect(res.body).not.toContain(teamA2);
  });

  it('Cas 2 — buildingId précis: fallback NULL puis priorité à la ligne spécifique', async () => {
    const before = await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/eligible-teams`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId, buildingId, timeWindow: 'business_hours', preferLevel: 'any' })
      .expect(200);
    if (!Array.isArray(before.body) || before.body.length === 0) { console.log('DBG eligible-before empty', before.text); }
    expect(before.body).toContain(teamA1);

    await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/matrix`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, teamId: teamA1, categoryId, buildingId, level: 'primary', window: 'business_hours' })
      .expect((r) => [200,201,204].includes(r.status));

    const after = await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/eligible-teams`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId, buildingId, timeWindow: 'business_hours', preferLevel: 'any' })
      .expect(200);
    if (!Array.isArray(after.body) || after.body.length === 0) { console.log('DBG eligible-after empty', after.text); }
    const countA1 = after.body.filter((t: string) => t === teamA1).length;
    expect(countA1).toBe(1);
  });

  it('Cas 3 — team inactive: exclue des résultats', async () => {
    const { Team } = require('../../src/modules/directory/models/team.model');
    await Team.update({ active: false }, { where: { id: teamA1 } });

    const res2 = await request(app.getHttpServer())
      .post(`/companies/${IDs.companyA}/competency/eligible-teams`)
      .set('x-actor', asActor('companyA_adminAll'))
      .send({ contractVersionId, categoryId, buildingId, timeWindow: 'business_hours', preferLevel: 'any' })
      .expect(200);
    if (!Array.isArray(res2.body) || res2.body.length === 0) { console.log('DBG eligible-inactive empty', res2.text); }
    expect(res2.body).not.toContain(teamA1);
    expect(res2.body).toContain(teamA3);
  });
});
