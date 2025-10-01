import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './modules/directory/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';

import { TicketsModuleV2 } from './modules/tickets/tickets.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { DirectoryModule } from './modules/directory/directory.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { RoutingModule } from './modules/routing/routing.module';
import { CostModule } from './modules/cost/cost.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { SatisfactionModule } from './modules/satisfaction/satisfaction.module';
import { ComfortModule } from './modules/comfort/comfort.module';
import { WellBeingModule } from './modules/well-being/well-being.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { SlaModule } from './modules/sla/sla.module';
import { CompetencyModule } from './modules/competency/competency.module';
import { HolidayModule } from './modules/holiday-calendar/infra/holiday.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'mainfix',
      password: process.env.DB_PASS || 'mainfix',
      database: process.env.DB_NAME || 'mainfix',
      autoLoadModels: true,
      synchronize: false,
      logging: process.env.SEQ_LOG === 'true' ? console.log : false,
    }),
    CatalogModule,
    CompaniesModule,
    TaxonomyModule,
    DirectoryModule,
    UsersModule,
    ContractsModule,
    SlaModule,

    TicketsModuleV2,
    ApprovalsModule,
    CostModule,
    SatisfactionModule,
    ComfortModule,
    WellBeingModule,
    RoutingModule,
    ReportsModule,
    AttachmentsModule,
    CompetencyModule,
    HolidayModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
