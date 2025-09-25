const path = require('path');
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: path.resolve(process.cwd(), envFile) });

module.exports = {
  development: {
    username: process.env.DB_USER || 'mainfix',
    password: process.env.DB_PASS || 'mainfix',
    database: process.env.DB_NAME || 'mainfix',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'sequelize_meta',
  },
  test: {
    username: process.env.TEST_DB_USER || 'test_user',
    password: process.env.TEST_DB_PASS || 'test_pass',
    database: process.env.TEST_DB_NAME || 'mainfix_test',
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    port: Number(process.env.TEST_DB_PORT) || 5433, // tu peux choisir 5432 si pas de conflit
    dialect: 'postgres',
    logging: true,
    migrationStorageTableName: 'sequelize_meta_test',
    synchronize: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'sequelize_meta',
  },
};
