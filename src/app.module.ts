import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TicketsModule } from './modules/tickets/tickets.module';

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
    UsersModule,
    CompaniesModule,
    AuthModule,
    TicketsModule,
  ],
  controllers: [AppController], // 👈 bien présent ici
  providers: [AppService],
})
export class AppModule {}
