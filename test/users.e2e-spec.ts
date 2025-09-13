import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/modules/auth/auth.module';
import { SqliteTestingModule } from './utils/slqlite-testing.module';
import { User } from '../src/modules/directory/models/user.model';

interface RegisterResponse {
  user: { email: string };
  access_token: string;
}

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, SqliteTestingModule([User])],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'a@b.com', password: 'secret' })
      .expect(201);
    const body = res.body as RegisterResponse;
    expect(body.user.email).toBe('a@b.com');
    expect(body.access_token).toBeDefined();
  });

  it('should login and access /auth/me', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'b@c.com', password: 'secret' })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'b@c.com', password: 'secret' })
      .expect(201);

    const loginBody = login.body as RegisterResponse;
    const token = loginBody.access_token;

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({ ok: true });
  });
});
