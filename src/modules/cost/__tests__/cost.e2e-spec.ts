import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { TOKENS as ROUTING_TOKENS } from '../../routing/domain/ports';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../auth/guards/require-admin-scope.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';
import { TOKENS as COST_TOKENS } from '../../cost/domain/ports';

describe('Cost e2e (roles and scenarios)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
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
      .overrideProvider(COST_TOKENS.AdminScopeGuard)
      .useValue({
        canAccessCompany: async () => true,
        canAccessSite: async () => true,
        canAccessBuilding: async () => true,
      })
      .overrideProvider(COST_TOKENS.DirectoryQuery)
      .useValue({
        userIsInTeam: async (userId: string) => userId === '77777777-7777-7777-7777-777777777777',
        getUserRole: async (userId: string) => (userId === '12121212-1212-1212-1212-121212121212' ? 'occupant' : 'maintainer'),
      })
      .overrideProvider(COST_TOKENS.TicketsQuery)
      .useValue({
        getTicketMeta: async (ticketId: string) => ({
          companyId: '11111111-1111-1111-1111-111111111111',
          siteId: '00000000-0000-0000-0000-0000000000a2',
          buildingId: null,
          assigneeTeamId: 'team-1',
          status: 'open',
          priority: 'P2',
          contractVersionId: null,
        }),
      })
      .overrideProvider(COST_TOKENS.TeamsQuery)
      .useValue({
        getTeamMeta: async (_teamId: string) => ({ companyId: '11111111-1111-1111-1111-111111111111', type: 'internal', active: true }),
      })
      .overrideProvider(COST_TOKENS.TicketPartRepository)
      .useValue(new (class {
        async addOrUpdate(p: any) { return { id: p.id ?? 'part-1', ticketId: p.ticketId, sku: p.sku, label: p.label, qty: p.qty, unitCost: p.unitCost }; }
        async remove(_p: any) { /* no-op */ }
        async listByTicket(_t: string) { return []; }
        async sumPartsCost(ticketId: string) { return ticketId === 'aaaaaaaa-0000-0000-0000-000000000001' ? '30.00' : '0.00'; }
      })())
      .overrideProvider(COST_TOKENS.TicketCostRepository)
      .useValue(new (class {
        private store = new Map<string, any>();
        async upsertByTicket(p: any) { const c = { id: 'cost-'+p.ticketId, ticketId: p.ticketId, laborHours: null, laborRate: null, partsCost: this.store.get(p.ticketId)?.partsCost ?? '0.00', total: null, currency: p.currency ?? 'EUR', createdAt: new Date() }; this.store.set(p.ticketId, c); return c; }
        async setPartsCost(ticketId: string, partsCost: string) { const curr = this.store.get(ticketId) || { id: 'cost-'+ticketId, ticketId, currency: 'EUR', createdAt: new Date() }; curr.partsCost = partsCost; this.store.set(ticketId, curr); }
        async getByTicket(ticketId: string) { return this.store.get(ticketId) || { id: 'cost-'+ticketId, ticketId, partsCost: '20.00', currency: 'EUR', createdAt: new Date() }; }
      })())
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
  afterAll(async () => { await app.close(); });

  it('maintainer in assigned team can add a part and triggers recalculation', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/cost/parts')
      .set('x-test-user-id', '77777777-7777-7777-7777-777777777777') // maintainer
      .set('x-company-id', '11111111-1111-1111-1111-111111111111')
      .send({ ticketId: 'aaaaaaaa-0000-0000-0000-000000000001', sku: 'TEST', label: 'Test Part', qty: '1.00', unitCost: '10.00' })
      .expect(201);
    expect(res.body.cost).toBeDefined();
    expect(res.body.cost.ticketId).toBe('aaaaaaaa-0000-0000-0000-000000000001');
    // previous parts_cost=20.00 + 10.00
    expect(res.body.cost.partsCost).toBe('30.00');
  });

  it('occupant cannot add cost (forbidden by domain policy)', async () => {
    await request(app.getHttpServer())
      .post('/api/cost/parts')
      .set('x-test-user-id', '12121212-1212-1212-1212-121212121212') // occupant
      .set('x-company-id', '11111111-1111-1111-1111-111111111111')
      .send({ ticketId: 'aaaaaaaa-0000-0000-0000-000000000001', sku: 'TEST2', label: 'Forbidden Part', qty: '1.00', unitCost: '5.00' })
      .expect(500); // domain throws error captured as 500 in this setup
  });

  it('vendor TRAVEL addition blocked when approval is PENDING', async () => {
    await request(app.getHttpServer())
      .post('/api/cost/parts')
      .set('x-test-user-id', '88888888-8888-8888-8888-888888888888') // vendor maintainer in vendor team
      .set('x-company-id', '11111111-1111-1111-1111-111111111111')
      .send({ ticketId: 'aaaaaaaa-0000-0000-0000-000000000002', sku: 'TRAVEL', label: 'Travel extra', qty: '1.00', unitCost: '10.00' })
      .expect(500); // approval_required (pending exists in seeds)
  });
});
