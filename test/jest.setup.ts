import { Sequelize } from 'sequelize';

let __sequelize: Sequelize | null = null;

async function ensureConnection(): Promise<Sequelize | null> {
  if (process.env.NODE_ENV !== 'test') return null;
  const reset = process.env.RESET_DB_BETWEEN_TESTS;
  if (reset && !['1', 'true', 'TRUE', 'yes', 'on'].includes(reset)) return null;
  if (__sequelize) return __sequelize;
  const host = process.env.TEST_DB_HOST || '127.0.0.1';
  const port = Number(process.env.TEST_DB_PORT || 5433);
  const username = process.env.TEST_DB_USER || 'test_user';
  const password = process.env.TEST_DB_PASS || 'test_pass';
  const database = process.env.TEST_DB_NAME || 'mainfix_test';
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host,
    port,
    username,
    password,
    database,
    logging: false,
  });
  try {
    await sequelize.authenticate();
    __sequelize = sequelize;
    return sequelize;
  } catch (_err) {
    // If DB is not reachable, skip resets silently to not break tests that mock repos
    return null;
  }
}

beforeEach(async () => {
  const sequelize = await ensureConnection();
  if (!sequelize) return;
  // Get all public tables except SequelizeMeta
  const [rows] = await sequelize.query<{ tablename: string }>(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('SequelizeMeta');",
  );
  const tables = (rows as any[]).map((r: any) => r.tablename).filter(Boolean);
  if (!tables.length) return;
  const quoted = tables.map((t) => `"${t}"`).join(',');
  await sequelize.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE;`);
});

afterAll(async () => {
  if (__sequelize) {
    await __sequelize.close();
    __sequelize = null;
  }
});

