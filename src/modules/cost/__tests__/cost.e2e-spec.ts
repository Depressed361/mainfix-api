import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from '../../../../test/setup-e2e';

describe('Cost e2e (roles and scenarios)', () => {
  let app: INestApplication;
  beforeAll(async () => { app = await createE2EApp(); });
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
