type Env = 'development' | 'test' | 'production';
const env = (process.env.NODE_ENV || 'development') as Env;

const base = {
  dialect: 'postgres',
  seederStorage: 'sequelize',
  migrationStorageTableName: 'sequelize_meta',
};

const config = {
  development: {
    ...base,
    url: process.env.DATABASE_URL,
  },
  test: {
    ...base,
    url: process.env.DATABASE_URL_TEST,
  },
  production: {
    ...base,
    url: process.env.DATABASE_URL,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { require: true } : undefined,
    },
  },
};

export default config[env];
