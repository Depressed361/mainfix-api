import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'], // 👈 pour tout voir au boot
  });

  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix('api'); // -> /api/...

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 MainFix API on http://localhost:${port}`);
}
bootstrap();
