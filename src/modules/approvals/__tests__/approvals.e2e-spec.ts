import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { TOKENS as ROUTING_TOKENS } from '../../routing/domain/ports';
import {
  TOKENS as APPROVAL_TOKENS,
  ApprovalRequestEntity,
  ApprovalStatus,
} from '../domain/ports';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RequireAdminRoleGuard } from '../../auth/guards/require-admin-role.guard';
import { RequireAdminScopeGuard } from '../../auth/guards/require-admin-scope.guard';
import { ScopesGuard } from '../../auth/guards/scopes.guard';

describe('Approvals e2e (roles and scenarios)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const pendingStore = new Map<string, ApprovalRequestEntity>();
    const TICKET_ID = 'aaaaaaaa-0000-0000-0000-000000000002';
    const approvalId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1';
    pendingStore.set(approvalId, {
      id: approvalId,
      ticketId: TICKET_ID,
      reason: 'TRAVEL_FEE',
      amountEstimate: '10.00',
      currency: 'EUR',
      status: 'PENDING',
      createdAt: new Date(),
    });

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
      .overrideProvider(APPROVAL_TOKENS.ApprovalRequestRepository)
      .useValue(
        new (class {
          async create(p: any): Promise<ApprovalRequestEntity> {
            const row: ApprovalRequestEntity = {
              id: approvalId,
              ticketId: p.ticketId,
              reason: p.reason ?? null,
              amountEstimate: p.amountEstimate ?? null,
              currency: p.currency ?? 'EUR',
              status: 'PENDING',
              createdAt: new Date(),
            };
            pendingStore.set(row.id, row);
            return row;
          }
          async setStatus(id: string, status: ApprovalStatus): Promise<void> {
            const row = pendingStore.get(id);
            if (!row) return;
            row.status = status;
            pendingStore.set(id, row);
          }
          async findById(id: string) {
            return pendingStore.get(id) ?? null;
          }
          async findPendingByTicket(ticketId: string) {
            const row = Array.from(pendingStore.values()).find(
              (r) => r.ticketId === ticketId && r.status === 'PENDING',
            );
            return row ?? null;
          }
          async list(q: any) {
            const rows = Array.from(pendingStore.values()).filter(
              (r) =>
                (!q.status || q.status.includes(r.status)) &&
                (!q.ticketIds || q.ticketIds.includes(r.ticketId)),
            );
            return { rows, total: rows.length };
          }
        })(),
      )
      .overrideProvider(APPROVAL_TOKENS.TicketsQuery)
      .useValue({
        getTicketMeta: async (ticketId: string) => ({
          companyId: '11111111-1111-1111-1111-111111111111',
          siteId: '00000000-0000-0000-0000-0000000000a2',
          buildingId: null,
          categoryId: 'cat',
          priority: 'P2',
          status: 'open',
          createdAt: new Date(),
          contractVersionId: 'cv',
        }),
      })
      .overrideProvider(APPROVAL_TOKENS.AdminScopeGuard)
      .useValue({
        canAccessCompany: async () => true,
        canAccessSite: async () => true,
        canAccessBuilding: async () => true,
      })
      .overrideProvider(APPROVAL_TOKENS.DirectoryQuery)
      .useValue({
        getUserMeta: async (_uid: string) => ({
          companyId: '11111111-1111-1111-1111-111111111111',
          role: 'admin',
          active: true,
        }),
      })
      .overrideProvider(APPROVAL_TOKENS.TicketCommand)
      .useValue({
        blockTransitions: async () => {},
        unblockTransitions: async () => {},
      })
      .overrideProvider(APPROVAL_TOKENS.TicketEventCommand)
      .useValue({ appendEvent: async () => {} })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  it('company admin can approve a pending travel approval', async () => {
    // fetch the pending request id for ticket aaaaaaaa-...002 to avoid drift
    const list = await request(app.getHttpServer())
      .get('/api/approvals/requests')
      .set('x-test-user-id', 'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb')
      .set('x-company-id', '11111111-1111-1111-1111-111111111111')
      .query({
        companyId: '11111111-1111-1111-1111-111111111111',
        status: ['PENDING'],
      })
      .expect(200);
    const pending = (list.body.rows || []).find(
      (r: any) => r.ticketId === 'aaaaaaaa-0000-0000-0000-000000000002',
    );
    expect(pending).toBeDefined();
    const approvalId = pending.id;

    await request(app.getHttpServer())
      .post(`/api/approvals/requests/${approvalId}/decision`)
      .set('x-test-user-id', 'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb') // seeded admin with company scope
      .set('x-company-id', '11111111-1111-1111-1111-111111111111')
      .send({ decision: 'APPROVED' })
      .expect(201);

    const after = await request(app.getHttpServer())
      .get('/api/tickets/aaaaaaaa-0000-0000-0000-000000000002/approvals/status')
      .expect(200);
    expect(after.body.status).toBe('APPROVED');
  });

  it('manager without admin scope cannot approve (policy)', async () => {
    await request(app.getHttpServer())
      .post(
        '/api/approvals/requests/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee3/decision',
      )
      .set('x-test-user-id', '66666666-6666-6666-6666-666666666666') // manager
      .set('x-company-id', '11111111-1111-1111-1111-111111111111')
      .send({ decision: 'APPROVED' })
      .expect(500); // scope forbidden -> thrown as error here
  });
});
