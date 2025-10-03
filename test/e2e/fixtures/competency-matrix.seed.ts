import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { IDs } from '../utils/auth-actor';
import { Company } from '../../../src/modules/companies/company.model';
import { Site } from '../../../src/modules/catalog/models/site.model';
import { Building } from '../../../src/modules/catalog/models/buildings.model';
import { Team } from '../../../src/modules/directory/models/team.model';

export async function seedCompetencyMatrixFixture(app: INestApplication) {
  await Company.upsert({ id: IDs.companyA, name: 'Company A' } as any);
  await Site.upsert({ id: IDs.siteA1, companyId: IDs.companyA, code: 'A1', name: 'Site A1', timezone: 'Europe/Paris' } as any);
  await Building.upsert({ id: IDs.buildingA1, siteId: IDs.siteA1, code: 'BA1', name: 'A1' } as any);
  await Team.upsert({ id: IDs.teamA1, companyId: IDs.companyA, name: 'Team A1', type: 'internal', active: true } as any);

  // Contract + Version v1
  const c = await request(app.getHttpServer())
    .post('/contracts')
    .set('x-actor', JSON.stringify({
      userId: 'seed',
      companyId: IDs.companyA,
      roles: ['admin'],
      siteIds: [IDs.siteA1],
      adminScopes: [{ level: 'company', companyId: IDs.companyA }],
    }))
    .send({ siteId: IDs.siteA1, name: 'CA', providerCompanyId: null })
    .expect((r) => [201, 409].includes(r.status));

  const contractId = c.body?.id ?? IDs.contractA;
  const v1 = await request(app.getHttpServer())
    .post('/contracts/versions')
    .set('x-actor', JSON.stringify({
      userId: 'seed',
      companyId: IDs.companyA,
      roles: ['admin'],
      siteIds: [IDs.siteA1],
      adminScopes: [{ level: 'company', companyId: IDs.companyA }],
    }))
    .send({ contractId, version: 1, coverage: { timeWindows: ['business_hours'] } })
    .expect((r) => [200, 201, 409].includes(r.status));

  const contractVersionId = v1.status === 409
    ? (await request(app.getHttpServer())
        .get('/contracts/versions?contractId=' + contractId)
        .set('x-actor', JSON.stringify({
          userId: 'seed',
          companyId: IDs.companyA,
          roles: ['admin'],
          siteIds: [IDs.siteA1],
          adminScopes: [{ level: 'company', companyId: IDs.companyA }],
        }))
        .then(r => r.body.find((x: any) => x.version === 1)?.id))
    : v1.body.id;

  // Taxonomy: Skill 'bearing', Category 'hvac' + mapping
  const skill = await request(app.getHttpServer())
    .post('/taxonomy/skills')
    .set('x-actor', JSON.stringify({
      userId: 'seed',
      companyId: IDs.companyA,
      roles: ['admin'],
      siteIds: [IDs.siteA1],
      adminScopes: [{ level: 'company', companyId: IDs.companyA }],
    }))
    .send({ key: 'bearing', label: 'Bearing Replacement' })
    .expect((r) => [201, 409].includes(r.status));

  const skillId = skill.status === 201
    ? skill.body.id
    : (await request(app.getHttpServer())
        .get('/taxonomy/skills')
        .set('x-actor', JSON.stringify({
          userId: 'seed',
          companyId: IDs.companyA,
          roles: ['admin'],
          siteIds: [IDs.siteA1],
          adminScopes: [{ level: 'company', companyId: IDs.companyA }],
        }))
        .then(r => r.body.find((x: any) => x.key === 'bearing')?.id));

  const cat = await request(app.getHttpServer())
    .post('/taxonomy/categories')
    .set('x-actor', JSON.stringify({
      userId: 'seed',
      companyId: IDs.companyA,
      roles: ['admin'],
      siteIds: [IDs.siteA1],
      adminScopes: [{ level: 'company', companyId: IDs.companyA }],
    }))
    .send({ key: 'hvac', label: 'HVAC' })
    .expect((r) => [201, 409].includes(r.status));

  const categoryId = cat.status === 201
    ? cat.body.id
    : (await request(app.getHttpServer())
        .get('/taxonomy/categories')
        .set('x-actor', JSON.stringify({
          userId: 'seed',
          companyId: IDs.companyA,
          roles: ['admin'],
          siteIds: [IDs.siteA1],
          adminScopes: [{ level: 'company', companyId: IDs.companyA }],
        }))
        .then(r => r.body.find((x: any) => x.key === 'hvac')?.id));

  await request(app.getHttpServer())
    .post('/taxonomy/category-skills')
    .set('x-actor', JSON.stringify({
      userId: 'seed',
      companyId: IDs.companyA,
      roles: ['admin'],
      siteIds: [IDs.siteA1],
      adminScopes: [{ level: 'company', companyId: IDs.companyA }],
    }))
    .send({ categoryId, skillId })
    .expect((r) => [200, 201, 204, 409].includes(r.status));

  return {
    contractVersionId,
    teamA1: IDs.teamA1,
    buildingA1: IDs.buildingA1,
    categoryHVAC: categoryId,
    skillBearing: skillId,
  };
}
