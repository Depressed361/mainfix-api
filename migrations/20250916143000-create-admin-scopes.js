'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        CREATE TYPE scope_type AS ENUM ('platform','company','site','building');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS admin_scopes (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scope scope_type NOT NULL,
        company_id UUID NULL REFERENCES companies(id) ON DELETE CASCADE,
        site_id UUID NULL REFERENCES sites(id) ON DELETE CASCADE,
        building_id UUID NULL REFERENCES buildings(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'admin_scopes_consistency'
        ) THEN
          ALTER TABLE admin_scopes
          ADD CONSTRAINT admin_scopes_consistency CHECK (
            (scope = 'platform' AND company_id IS NULL AND site_id IS NULL AND building_id IS NULL) OR
            (scope = 'company'  AND company_id IS NOT NULL AND site_id IS NULL AND building_id IS NULL) OR
            (scope = 'site'     AND site_id    IS NOT NULL AND building_id IS NULL) OR
            (scope = 'building' AND building_id IS NOT NULL)
          );
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_scopes_user_scope
        ON admin_scopes (user_id, scope);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_scopes_company
        ON admin_scopes (company_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_scopes_site
        ON admin_scopes (site_id);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_scopes_building
        ON admin_scopes (building_id);
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS admin_scopes_unique_scope
        ON admin_scopes (
          user_id,
          scope,
          COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE(site_id, '00000000-0000-0000-0000-000000000000'::uuid),
          COALESCE(building_id, '00000000-0000-0000-0000-000000000000'::uuid)
        );
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS admin_scopes;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS scope_type;');
  },
};
