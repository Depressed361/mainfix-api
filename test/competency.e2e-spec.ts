import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from './setup-e2e';

describe('Competency lifecycle (e2e)', () => {
  let app: INestApplication;
  const base = '/api';

  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const unique = Date.now().toString(36);

  const actors = {
    super: 'super-admin',
    company: 'company-admin',
  } as const;

  const server = () => app.getHttpServer();

  async function post<T = any>(
    url: string,
    body: Record<string, unknown>,
    actor: string = actors.company,
    companyId?: string,
  ): Promise<T> {
    const res = await request(server())
      .post(`${base}${url}`)
      .set('x-test-actor', actor)
      .set('x-company-id', companyId ?? '')
      .send(body);
    if (res.status >= 400) {
      console.error(`[POST ${url}]`, res.status, res.body);
    }
    expect(res.status).toBeLessThan(400);
    return res.body as T;
  }

  async function get<T = any>(
    url: string,
    query: Record<string, unknown>,
    actor: string = actors.company,
    companyId?: string,
  ): Promise<T> {
    const res = await request(server())
      .get(`${base}${url}`)
      .set('x-test-actor', actor)
      .set('x-company-id', companyId ?? '')
      .query(query);
    if (res.status >= 400) {
      console.error(`[GET ${url}]`, res.status, res.body);
    }
    expect(res.status).toBeLessThan(400);
    return res.body as T;
  }

  it('creates company/site/assets, taxonomy, contract and resolves competency', async () => {
    const company = await post<{ id: string }>(
      '/companies',
      {
        name: `Demo Company ${unique}`,
      },
      actors.super,
    );

    const site = await post<{ id: string }>(
      '/sites',
      {
        companyId: company.id,
        code: `HQ-${unique}`,
        name: `Headquarters ${unique}`,
        timezone: 'Europe/Paris',
      },
      actors.company,
      company.id,
    );

    const building = await post<{ id: string }>(
      '/buildings',
      {
        siteId: site.id,
        code: `BLD-${unique}`,
        name: `Building ${unique}`,
      },
      actors.company,
      company.id,
    );

    const location = await post<{ id: string }>(
      '/locations',
      {
        buildingId: building.id,
        code: `LOC-${unique}`,
        description: 'Demo location',
      },
      actors.company,
      company.id,
    );

    await post(
      '/assets',
      {
        companyId: company.id,
        locationId: location.id,
        code: `AST-${unique}`,
        kind: 'ATM',
      },
      actors.company,
      company.id,
    );

    const category = await post<{ id: string }>(
      `/companies/${company.id}/categories`,
      {
        key: `network-${unique}`,
        label: 'Network Services',
      },
      actors.company,
      company.id,
    );

    await post(
      `/companies/${company.id}/skills`,
      {
        key: `network-l1-${unique}`,
        label: 'Network L1',
      },
      actors.company,
      company.id,
    );

    const team = await post<{ id: string }>(
      '/teams',
      {
        companyId: company.id,
        name: `Network Crew ${unique}`,
        type: 'internal',
        active: true,
      },
      actors.company,
      company.id,
    );

    const contract = await post<{ id: string }>(
      '/contracts',
      {
        siteId: site.id,
        name: `Network Contract ${unique}`,
        active: true,
      },
      actors.company,
      company.id,
    );

    const contractVersion = await post<{ id: string }>(
      `/contracts/${contract.id}/versions`,
      {
        version: 1,
        coverage: {
          network: {
            priority: 'P1',
            response: '1h',
            resolution: '4h',
          },
        },
        escalation: {},
        approvals: {},
      },
      actors.company,
      company.id,
    );

    await post(
      `/contracts/${contract.id}/versions/1/competencies`,
      {
        contractVersionId: contractVersion.id,
        teamId: team.id,
        categoryId: category.id,
        buildingId: building.id,
        level: 'primary',
        window: 'business_hours',
      },
      actors.company,
      company.id,
    );

    const resolved = await get<any[]>(
      `/contracts/${contract.id}/versions/1/competencies/resolve`,
      {
        contractId: contract.id,
        version: 1,
        categoryId: category.id,
        buildingId: building.id,
        window: 'business_hours',
      },
      actors.company,
      company.id,
    );

    expect(Array.isArray(resolved)).toBe(true);
    expect(resolved.length).toBeGreaterThan(0);
  });
});
