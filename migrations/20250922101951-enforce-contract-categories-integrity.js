"use strict";

module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      console.warn('[migration] Skipping contract_categories integrity trigger for dialect', dialect);
      return;
    }

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION enforce_contract_categories_integrity()
      RETURNS trigger AS $$
      DECLARE
        v_company_id  UUID;
        v_cat_company UUID;
      BEGIN
        SELECT s.company_id INTO v_company_id
        FROM contract_versions cv
        JOIN contracts c ON c.id = cv.contract_id
        JOIN sites s      ON s.id = c.site_id
        WHERE cv.id = NEW.contract_version_id;

        SELECT company_id INTO v_cat_company FROM categories WHERE id = NEW.category_id;

        IF v_cat_company IS NULL OR v_cat_company <> v_company_id THEN
          RAISE EXCEPTION 'Category % not owned by contract''s company', NEW.category_id;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_contract_categories_integrity ON contract_categories;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_contract_categories_integrity
      BEFORE INSERT OR UPDATE ON contract_categories
      FOR EACH ROW
      EXECUTE FUNCTION enforce_contract_categories_integrity();
    `);
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_contract_categories_integrity ON contract_categories;
    `);

    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS enforce_contract_categories_integrity();
    `);
  },
};
