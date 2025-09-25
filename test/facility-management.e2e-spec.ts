import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from './setup-e2e';

describe('Facility management vendor scenario (e2e)', () => {
  let app: INestApplication;
  const base = '/api';
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

  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows a vendor company to operate on a client site with SLA coverage', async () => {
    const unique = Date.now().toString(36);

    const hermes = await post<{ id: string }>(
      '/companies',
      {
        name: `Hermes ${unique}`,
      },
      actors.super,
    );

    const hermesFacilities = await post<{ id: string }>(
      '/companies',
      {
        name: `Hermes Facilities ${unique}`,
      },
      actors.super,
    );

    const site = await post<{ id: string }>(
      '/sites',
      {
        companyId: hermes.id,
        code: `HERM-${unique}`,
        name: `Hermes HQ ${unique}`,
        timezone: 'Europe/Paris',
      },
      actors.company,
      hermes.id,
    );

    const building = await post<{ id: string }>(
      '/buildings',
      {
        siteId: site.id,
        code: `HERM-BLD-${unique}`,
        name: `Hermes Tower ${unique}`,
      },
      actors.company,
      hermes.id,
    );

    const category = await post<{ id: string }>(
      `/companies/${hermes.id}/taxonomy/categories`,
      {
        key: `facility-${unique}`,
        label: 'Facility Operations',
      },
      actors.company,
      hermes.id,
    );

    const skill = await post<{ id: string }>(
      `/companies/${hermes.id}/taxonomy/skills`,
      {
        key: `hvac-${unique}`,
        label: 'HVAC Maintenance',
      },
      actors.company,
      hermes.id,
    );

    await post(
      `/companies/${hermes.id}/taxonomy/category-skills`,
      {
        categoryId: category.id,
        skillId: skill.id,
      },
      actors.company,
      hermes.id,
    );

    const vendorTeam = await post<{ id: string; name: string }>(
      '/teams',
      {
        companyId: hermesFacilities.id,
        name: `Hermes Facilities Crew ${unique}`,
        type: 'vendor',
        active: true,
      },
      actors.super,
      hermesFacilities.id,
    );

    const contract = await post<{ id: string }>(
      '/contracts',
      {
        siteId: site.id,
        name: `Hermes FM Contract ${unique}`,
        providerCompanyId: hermesFacilities.id,
        active: true,
      },
      actors.company,
      hermes.id,
    );

    const version = await post<{ id: string }>(
      `/contracts/${contract.id}/versions`,
      {
        version: 1,
        coverage: {
          hvac: {
            ack: '01:00',
            resolve: '04:00',
          },
        },
        escalation: {
          contact: 'Vendor hotline',
        },
        approvals: {},
      },
      actors.company,
      hermes.id,
    );

    await post(
      `/contracts/${contract.id}/versions/1/competencies`,
      {
        contractVersionId: version.id,
        teamId: vendorTeam.id,
        categoryId: category.id,
        buildingId: building.id,
        level: 'primary',
        window: 'business_hours',
      },
      actors.company,
      hermes.id,
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
      hermes.id,
    );

    expect(Array.isArray(resolved)).toBe(true);
    expect(resolved.length).toBeGreaterThan(0);
    const primary = resolved[0] as Record<string, any>;
    expect(primary.team_id ?? primary.teamId).toBe(vendorTeam.id);
    expect(primary.team_name ?? primary.teamName).toContain('Hermes Facilities Crew');
    expect(primary.category_id ?? primary.categoryId).toBe(category.id);
  });
});



