import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
/*
import { ExecutionContext } from '@nestjs/common';


class TestAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: any }>();
    req.user = {
      id: 1,
      email: 'test@mainfix.io',
      roles: ['admin'],
      tenantId: 1,
    };
    return true;
  }
}*/

export async function createE2EApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  // app.useGlobalGuards(new TestAuthGuard());
  await app.init();
  return app;
}
