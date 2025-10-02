import { INestApplication } from '@nestjs/common';
import { IDs } from '../utils/auth-actor';
import { Company } from '../../../src/modules/companies/company.model';
import { Site } from '../../../src/modules/catalog/models/site.model';
import { Contract } from '../../../src/modules/contracts/models/contract.model';

export async function seedContractsFixture(_app: INestApplication) {
  await Company.upsert({ id: IDs.companyA, name: 'Company A' } as any);
  await Site.upsert({ id: IDs.siteA1, companyId: IDs.companyA, code: 'A1', name: 'Site A1', timezone: 'Europe/Paris' } as any);
  await Contract.upsert({ id: IDs.contractA, siteId: IDs.siteA1, name: 'CA', active: true } as any);
  return { contractA: IDs.contractA } as const;
}
