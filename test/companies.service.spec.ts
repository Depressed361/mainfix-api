import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { SqliteTestingModule } from './utils/slqlite-testing.module';
import { CompaniesService } from '../src/modules/companies/services/companies.service';
import { Company } from '../src/modules/companies/company.model';

describe('CompaniesService', () => {
  let moduleRef: TestingModule;
  let service: CompaniesService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [SqliteTestingModule([Company]), SequelizeModule.forFeature([Company])],
      providers: [CompaniesService],
    }).compile();

    service = moduleRef.get(CompaniesService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('creates and retrieves a company', async () => {
    const created = await service.create({ name: 'Acme Corp' });
    const found = await service.findOne(created.get('id') as string);
    expect(found.get('name')).toBe('Acme Corp');
  });

  it('lists companies by creation date desc', async () => {
    await service.create({ name: 'Beta Corp' });
    await service.create({ name: 'Gamma Corp' });

    const list = await service.findAll();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list[0]!.get('createdAt')).toBeInstanceOf(Date);
  });

  it('removes a company', async () => {
    const created = await service.create({ name: 'Delete Me' });
    const response = await service.remove(created.get('id') as string);
    expect(response).toEqual({ deleted: true });
    await expect(service.findOne(created.get('id') as string)).rejects.toThrow('Company not found');
  });
});
