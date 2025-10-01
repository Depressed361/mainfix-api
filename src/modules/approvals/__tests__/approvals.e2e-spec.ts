import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from '../../../../test/setup-e2e';

describe('Approvals e2e (roles and scenarios)', () => {
  let app: INestApplication;
  beforeAll(async () => { app = await createE2EApp(); });
  afterAll(async () => { await app.close(); });

  it('company admin can approve a pending travel approval', async () => {
    // fetch the pending request id for ticket aaaaaaaa-...002 to avoid drift
    const list = await request(app.getHttpServer())
      .get('/api/approvals/requests')
      .set('x-test-user-id', 'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb')
      .set('x-company-id', '11111111-1111-1111-1111-111111111111')
      .query({ companyId: '11111111-1111-1111-1111-111111111111', status: ['PENDING'] })
      .expect(200);
    const pending = (list.body.rows || []).find((r: any) => r.ticketId === 'aaaaaaaa-0000-0000-0000-000000000002');
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
      .post('/api/approvals/requests/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee3/decision')
      .set('x-test-user-id', '66666666-6666-6666-6666-666666666666') // manager
      .set('x-company-id', '11111111-1111-1111-1111-111111111111')
      .send({ decision: 'APPROVED' })
      .expect(500); // scope forbidden -> thrown as error here
  });
});
