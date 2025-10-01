import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CompetencyAdminController } from '../infra/competency.controller';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { CompanyScopeGuard } from '../../auth/guards/company-scope.guard';
import type { AuthenticatedActor } from '../../auth/auth-actor.types';
import { TOKENS } from '../domain/ports';
import { GrantTeamZone } from '../domain/use-cases/GrantTeamZone';
import { RevokeTeamZone } from '../domain/use-cases/RevokeTeamZone';
import { GrantTeamSkill } from '../domain/use-cases/GrantTeamSkill';
import { RevokeTeamSkill } from '../domain/use-cases/RevokeTeamSkill';
import { UpsertCompetency } from '../domain/use-cases/UpsertCompetency';
import { RemoveCompetency } from '../domain/use-cases/RemoveCompetency';
import { ResolveEligibleTeams } from '../domain/use-cases/ResolveEligibleTeams';

const actor: AuthenticatedActor = {
  id: 'user', email: 'u@test', role: 'admin', companyId: 'company-1', scopeStrings: ['admin:company'],
  companyScopeIds: ['company-1'], siteScopeIds: [], buildingScopeIds: [], siteId: null, scopes: [],
};

describe('Competency eligible teams (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CompetencyAdminController],
      providers: [
        { provide: TOKENS.TeamZoneRepository, useValue: { exists: async () => true, upsert: async () => {}, delete: async () => {}, listByTeam: async () => [], listByBuilding: async () => [] } },
        { provide: TOKENS.TeamSkillRepository, useValue: { listByTeam: async () => [], upsert: async () => {}, delete: async () => {}, listTeamsBySkill: async () => [], hasSkill: async () => true } },
        { provide: TOKENS.CompetencyMatrixRepository, useValue: { listByCategory: async (cv: string, cat: string) => [
          { id: '1', contractVersionId: cv, teamId: 't1', categoryId: cat, buildingId: null, level: 'primary', window: 'any' },
          { id: '2', contractVersionId: cv, teamId: 't2', categoryId: cat, buildingId: null, level: 'backup', window: 'business_hours' },
        ], upsert: async () => ({}), deleteByUniqueKey: async () => {} } },
        { provide: TOKENS.ContractQuery, useValue: { getContractVersionMeta: async () => ({ contractId: 'c', siteId: 's', companyId: 'company-1' }) } },
        { provide: TOKENS.CatalogQuery, useValue: { getBuildingMeta: async () => ({ siteId: 's', companyId: 'company-1' }) } },
        { provide: TOKENS.TeamQuery, useValue: { getTeamMeta: async () => ({ companyId: 'company-1', active: true }) } },
        { provide: TOKENS.TaxonomyQuery, useValue: { requiredSkillsForCategory: async () => [] } },
        // Use-cases
        { provide: GrantTeamZone, useFactory: (zones, cq, cat, tq) => new GrantTeamZone(zones, cq, cat, tq), inject: [TOKENS.TeamZoneRepository, TOKENS.ContractQuery, TOKENS.CatalogQuery, TOKENS.TeamQuery] },
        { provide: RevokeTeamZone, useFactory: (zones, cq, cat, tq) => new RevokeTeamZone(zones, cq, cat, tq), inject: [TOKENS.TeamZoneRepository, TOKENS.ContractQuery, TOKENS.CatalogQuery, TOKENS.TeamQuery] },
        { provide: GrantTeamSkill, useFactory: (skills, cq, tq) => new GrantTeamSkill(skills, cq, tq), inject: [TOKENS.TeamSkillRepository, TOKENS.ContractQuery, TOKENS.TeamQuery] },
        { provide: RevokeTeamSkill, useFactory: (skills, cq, tq) => new RevokeTeamSkill(skills, cq, tq), inject: [TOKENS.TeamSkillRepository, TOKENS.ContractQuery, TOKENS.TeamQuery] },
        { provide: UpsertCompetency, useFactory: (m, tx, ts, cq, cat, tq) => new UpsertCompetency(m, tx, ts, cq, cat, tq), inject: [TOKENS.CompetencyMatrixRepository, TOKENS.TaxonomyQuery, TOKENS.TeamSkillRepository, TOKENS.ContractQuery, TOKENS.CatalogQuery, TOKENS.TeamQuery] },
        { provide: RemoveCompetency, useFactory: (m, cq, cat, tq) => new RemoveCompetency(m, cq, cat, tq), inject: [TOKENS.CompetencyMatrixRepository, TOKENS.ContractQuery, TOKENS.CatalogQuery, TOKENS.TeamQuery] },
        { provide: ResolveEligibleTeams, useFactory: (m, z, s, t, tx) => new ResolveEligibleTeams(m, z, s, t, tx), inject: [TOKENS.CompetencyMatrixRepository, TOKENS.TeamZoneRepository, TOKENS.TeamSkillRepository, TOKENS.TeamQuery, TOKENS.TaxonomyQuery] },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: (ctx: any) => { const req = ctx.switchToHttp().getRequest(); req.actor = actor; return true; } })
      .overrideGuard(RequireAdminRoleGuard).useValue({ canActivate: () => true })
      .overrideGuard(ScopesGuard).useValue({ canActivate: () => true })
      .overrideGuard(CompanyScopeGuard).useValue({ canActivate: (ctx: any) => { const req = ctx.switchToHttp().getRequest(); req.actor = actor; req.companyId = actor.companyId; return true; } })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('returns eligible teams ordered by level', async () => {
    const res = await request(app.getHttpServer())
      .post('/companies/company-1/competency/eligible-teams')
      .send({
        contractVersionId: 'cv-1', categoryId: 'cat-1', timeWindow: 'business_hours',
      })
      .expect(201);
    expect(res.body).toEqual(['t1', 't2']);
  });
});
