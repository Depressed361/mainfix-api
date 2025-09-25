import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { SqliteTestingModule } from './utils/slqlite-testing.module';
import { UsersService } from '../src/modules/directory/users/users.service';
import { User } from '../src/modules/directory/models/user.model';

describe('UsersService', () => {
  let moduleRef: TestingModule;
  let service: UsersService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        SqliteTestingModule([User]),
        SequelizeModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('creates and finds a user', async () => {
    const created = await service.create({
      companyId: '550e8400-e29b-41d4-a716-446655440000',
      email: 'john@acme.com',
      displayName: 'John',
      role: 'occupant',
      passwordHash: 'hash',
      active: true,
    });
    const found = await service.findOne(created.id);
    expect(found).not.toBeNull();
    expect(found!.get('email')).toBe('john@acme.com');
  });

  it('lists users filtered by company', async () => {
    await service.create({
      companyId: '00000000-0000-0000-0000-000000000001',
      email: 'alice@acme.com',
      displayName: 'Alice',
      role: 'manager',
      passwordHash: 'hash',
      active: true,
    });
    await service.create({
      companyId: '00000000-0000-0000-0000-000000000002',
      email: 'bob@other.com',
      displayName: 'Bob',
      role: 'admin',
      passwordHash: 'hash',
      active: true,
    });

    const acmeUsers = await service.findAll(
      '00000000-0000-0000-0000-000000000001',
    );
    expect(acmeUsers).toHaveLength(1);
    expect(acmeUsers[0].get('email')).toBe('alice@acme.com');
  });

  it('deactivates a user via remove', async () => {
    const created = await service.create({
      companyId: '00000000-0000-0000-0000-000000000003',
      email: 'charlie@acme.com',
      displayName: 'Charlie',
      role: 'approver',
      passwordHash: 'hash',
      active: true,
    });

    const response = await service.remove(created.id);
    expect(response).toEqual({ deactivated: true });

    const updated = await service.findById(created.id);
    expect(updated.get('active')).toBe(false);
  });
});
