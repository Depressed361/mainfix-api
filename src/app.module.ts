import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './modules/users/users.controller';
import { UsersService } from './modules/users/users.service';
import { UsersModule } from './modules/users/users.module';

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
    // Modules
    UsersModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
