import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { HealthModule } from './modules/health/health.module';
import { QueueModule } from './modules/queue/queue.module';
import { CompaniesController } from './modules/companies.controller';
import { CompaniesService } from './modules/companies.service';
import { CompaniesModule } from './modules/companies/companies.module';
import { UsersController } from './modules/users.controller';
import { UsersService } from './modules/users.service';
import { UsersModule } from './modules/users/users.module';
import { HealthController } from './modules/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        dialect: 'postgres',
        host: cfg.get('DB_HOST'),
        port: Number(cfg.get('DB_PORT')),
        username: cfg.get('DB_USER'),
        password: cfg.get('DB_PASS'),
        database: cfg.get('DB_NAME'),
        logging: false,
        models: [], // on auto-charge dans les modules
        autoLoadModels: true, // DEV: crée les tables à partir des models
        synchronize: true, // DEV ONLY (migrations à prévoir ensuite)
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    CompaniesModule,
    UsersModule,
    QueueModule, // BullMQ (escalades SLA, emails, push)
  ],
  controllers: [HealthController, UsersController, CompaniesController],
  providers: [UsersService, CompaniesService],
})
export class AppModule {}
