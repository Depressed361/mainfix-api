import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2EApp } from './setup-e2e';

describe('Tickets workflow (e2e)', () => {
  let app: INestApplication;
  const base = '/api';
  const actors = {
    super: 'super-admin',
    company: 'company-admin',
  } as const;

  const server = () => app.getHttpServer();

  const post = async <T = any>(
    url: string,
    body: Record<string, unknown>,
    actor: string = actors.company,
    companyId?: string,
    userId?: string,
  ): Promise<T> => {
    const reqBuilder = request(server())
      .post(`${base}${url}`)
      .set('x-test-actor', actor)
      .set('x-company-id', companyId ?? '');
    if (userId) {
      reqBuilder.set('x-test-user-id', userId);
    }
    const res = await reqBuilder.send(body);
    if (res.status >= 400) {
      console.error(`[POST ${url}]`, res.status, res.body);
    }
    expect(res.status).toBeLessThan(400);
    return res.body as T;
  };

  const patch = async <T = any>(
    url: string,
    body: Record<string, unknown>,
    actor: string = actors.company,
    companyId?: string,
    userId?: string,
  ): Promise<T> => {
    const reqBuilder = request(server())
      .patch(`${base}${url}`)
      .set('x-test-actor', actor)
      .set('x-company-id', companyId ?? '');
    if (userId) {
      reqBuilder.set('x-test-user-id', userId);
    }
    const res = await reqBuilder.send(body);
    if (res.status >= 400) {
      console.error(`[PATCH ${url}]`, res.status, res.body);
    }
    expect(res.status).toBeLessThan(400);
    return res.body as T;
  };
  beforeAll(async () => {
    app = await createE2EApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a ticket, auto-assigns and handles status workflow', async () => {
    const unique = Date.now().toString(36);

    const hermes = await post<{ id: string }>(
      '/companies',
      { name: `Hermes ${unique}` },
      actors.super,
    );

    await post<{ id: string }>(
      '/companies',
      { name: `Hermes Facilities ${unique}` },
      actors.super,
    );

    const vinci = await post<{ id: string }>(
      '/companies',
      { name: `Vinci ${unique}` },
      actors.super,
    );

    const reporter = await post<{ id: string }>(
      '/users',
      {
        companyId: hermes.id,
        email: `reporter+${unique}@example.com`,
        displayName: 'Reporter',
        role: 'admin',
        passwordHash: 'hashed-password',
      },
      actors.super,
    );

    const companyAdmin = await post<{ id: string }>(
      '/users',
      {
        companyId: hermes.id,
        email: `company-admin+${unique}@example.com`,
        displayName: 'Company Admin',
        role: 'admin',
        passwordHash: 'hashed-password',
      },
      actors.super,
    );
    await post(
      '/admin-scopes',
      {
        userId: companyAdmin.id,
        scope: 'company',
        companyId: hermes.id,
      },
      actors.super,
    );

    const site = await post<{ id: string }>(
      '/sites',
      {
        companyId: hermes.id,
        code: `PAR-${unique}`,
        name: `Paris HQ ${unique}`,
        timezone: 'Europe/Paris',
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );

    await post(
      '/admin-scopes',
      {
        userId: companyAdmin.id,
        scope: 'site',
        companyId: hermes.id,
        siteId: site.id,
      },
      actors.super,
    );

    const buildingA = await post<{ id: string }>(
      '/buildings',
      {
        siteId: site.id,
        code: `PAR-A-${unique}`,
        name: `Building A ${unique}`,
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );

    await post(
      '/admin-scopes',
      {
        userId: companyAdmin.id,
        scope: 'building',
        buildingId: buildingA.id,
      },
      actors.super,
    );

    const category = await post<{ id: string }>(
      `/companies/${hermes.id}/taxonomy/categories`,
      {
        key: `plumbing-${unique}`,
        label: 'Plumbing',
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );

    const skill = await post<{ id: string }>(
      `/companies/${hermes.id}/taxonomy/skills`,
      {
        key: `plumbing-skill-${unique}`,
        label: 'Plumbing Skill',
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );

    await post(
      `/companies/${hermes.id}/taxonomy/category-skills`,
      {
        categoryId: category.id,
        skillId: skill.id,
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );

    const vinciPrimaryTeam = await post<{ id: string }>(
      '/teams',
      {
        companyId: vinci.id,
        name: `Vinci Plumbing ${unique}`,
        type: 'vendor',
        active: true,
      },
      actors.super,
      vinci.id,
    );

    const vinciBackupTeam = await post<{ id: string }>(
      '/teams',
      {
        companyId: vinci.id,
        name: `Vinci Backup ${unique}`,
        type: 'vendor',
        active: true,
      },
      actors.super,
      vinci.id,
    );

    const contract = await post<{ id: string }>(
      '/contracts',
      {
        siteId: site.id,
        name: `FM Contract ${unique}`,
        providerCompanyId: vinci.id,
        active: true,
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );

    const contractVersion = await post<{ id: string }>(
      `/contracts/${contract.id}/versions`,
      {
        version: 1,
        coverage: {
          plumbing: {
            ack: '01:00',
            resolve: '04:00',
          },
        },
        escalation: {},
        approvals: {},
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );

    await post(
      `/contracts/${contract.id}/versions/1/competencies`,
      {
        contractVersionId: contractVersion.id,
        teamId: vinciPrimaryTeam.id,
        categoryId: category.id,
        buildingId: buildingA.id,
        level: 'primary',
        window: 'business_hours',
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );

    await post(
      `/contracts/${contract.id}/versions/1/competencies`,
      {
        contractVersionId: contractVersion.id,
        teamId: vinciBackupTeam.id,
        categoryId: category.id,
        level: 'backup',
        window: 'any',
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );

    const ticket = await post<{
      id: string;
      status: string;
      assigneeTeamId: string | null;
      number: string;
    }>(
      '/tickets',
      {
        companyId: hermes.id,
        siteId: '22222222-bbbb-4ccc-8ddd-000000000002',
        buildingId: buildingA.id,
        categoryId: category.id,
        reporterId: reporter.id,
        priority: 'P2',
        contractId: contract.id,
        contractVersion: 1,
        title: 'Water leak in restroom',
        description: 'Leak detected on third floor',
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );

    expect(ticket.number).toMatch(/^TK-/);
    expect(ticket.status).toBe('open');
    expect(ticket.assigneeTeamId).toBeNull();

    const autoAssigned = await patch<{
      assigneeTeamId: string;
      status: string;
    }>(
      `/tickets/${ticket.id}/assign`,
      {
        auto: true,
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );
    expect(autoAssigned.assigneeTeamId).toBe(vinciPrimaryTeam.id);
    expect(autoAssigned.status).toBe('assigned');

    const inProgress = await patch<{ status: string }>(
      `/tickets/${ticket.id}/status`,
      {
        status: 'in_progress',
      },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );
    expect(inProgress.status).toBe('in_progress');

    const reassigned = await patch<{ assigneeTeamId: string; status: string }>(
      `/tickets/${ticket.id}/assign`,
      {
        teamId: vinciBackupTeam.id,
      },

      actors.company,
      hermes.id,
      companyAdmin.id,
    );
    expect(reassigned.assigneeTeamId).toBe(vinciBackupTeam.id);
    expect(reassigned.status).toBe('in_progress');

    await patch(
      `/tickets/${ticket.id}/status`,
      { status: 'resolved' },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );
    const closed = await patch<{ status: string }>(
      `/tickets/${ticket.id}/status`,
      { status: 'closed' },
      actors.company,
      hermes.id,
      companyAdmin.id,
    );
    expect(closed.status).toBe('closed');
  });
});
