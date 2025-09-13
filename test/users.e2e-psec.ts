import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from '../src/modules/users/users.module';
import { CreateUserDto } from '../src/modules/users/dto/create-user.dto';

// 👇 Ajout : type de la réponse
type UserResponse = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  companyId: string;
  active: boolean;
};

// 👇 Ajout : garde de type pour sécuriser l’accès
function assertIsUserResponse(x: unknown): asserts x is UserResponse {
  if (!x || typeof x !== 'object') throw new Error('Invalid response');
  const o = x as Record<string, unknown>;
  if (typeof o.email !== 'string') throw new Error('Invalid response: email');
  if (typeof o.id !== 'string') throw new Error('Invalid response: id');
}

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      companyId: 'c',
      email: 'a@b.com',
      displayName: 'A',
      role: 'admin',
    };

    const res = await request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(201);

    // 👇 Sécurisation du body
    const body: unknown = res.body;
    assertIsUserResponse(body);

    expect(body.email).toBe(dto.email);
    expect(body.displayName).toBe(dto.displayName);
    expect(body.role).toBe(dto.role);
    expect(body.companyId).toBe(dto.companyId);
    expect(body.active).toBe(true);
  });
});
