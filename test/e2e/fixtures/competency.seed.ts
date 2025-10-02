import { INestApplication } from '@nestjs/common';
import { Company } from '../../../src/modules/companies/company.model';
import { Site } from '../../../src/modules/catalog/models/site.model';
import { Building } from '../../../src/modules/catalog/models/buildings.model';
import { Team } from '../../../src/modules/directory/models/team.model';
import { IDs } from '../utils/auth-actor';

export async function seedCompetencyBasics(app: INestApplication) {
  await Company.upsert({ id: IDs.companyA, name: 'Company A' } as any);
  await Site.upsert({ id: IDs.siteA1, companyId: IDs.companyA, code: 'A1', name: 'Site A1', timezone: 'Europe/Paris' } as any);
  await Building.upsert({ id: IDs.buildingA1, siteId: IDs.siteA1, code: 'BA1', name: 'A1' } as any);
  await Team.upsert({ id: IDs.teamA1, companyId: IDs.companyA, name: 'Team A1', type: 'internal', active: true } as any);
}

