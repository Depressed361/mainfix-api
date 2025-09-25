import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { User } from '../../directory/models/user.model';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  const userModelMock = {
    create: jest.fn(),
    findByPk: jest.fn(),
  };
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User), useValue: userModelMock },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  beforeEach(() => jest.clearAllMocks());

  it('create() creates a user', async () => {
    userModelMock.create.mockResolvedValue({ id: '1', email: 'a@b.com' });
    const dto: CreateUserDto = {
      companyId: 'c',
      email: 'a@b.com',
      displayName: 'A',
      role: 'admin',
    };
    const created = await service.create(dto);
    expect(created).toMatchObject({ id: '1', email: 'a@b.com' });
    expect(userModelMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.com' }),
    );
  });

  it('findOne() throws when missing', async () => {
    userModelMock.findByPk.mockResolvedValue(null);
    await expect(service.findById('123')).rejects.toThrow('User not found');
  });
});
