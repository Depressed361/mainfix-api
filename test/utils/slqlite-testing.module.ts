import { SequelizeModule } from '@nestjs/sequelize';

export function SqliteTestingModule(models: any[] = []) {
  return SequelizeModule.forRoot({
    dialect: 'sqlite',
    storage: ':memory:',
    autoLoadModels: true,
    synchronize: true,
    logging: false,
    models,
  });
}
