//init sequelize + associate models
import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL as string;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.SEQ_LOG === 'true' ? console.log : false,
});

// helper to test connection on boot
export async function connectDB() {
  await sequelize.authenticate();
  console.log('✅ Database connected');
}
