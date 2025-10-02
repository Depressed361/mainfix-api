import { INestApplication } from '@nestjs/common';
import { IDs } from '../utils/auth-actor';
import { Company } from '../../../src/modules/companies/company.model';

export async function seedTaxonomyFixture(_app: INestApplication) {
  await Company.upsert({ id: IDs.companyA, name: 'Company A' } as any);
  await Company.upsert({ id: IDs.companyB, name: 'Company B' } as any);
}
