"use strict";

module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      console.warn('[migration] Skipping category_skills tenant guard for dialect', dialect);
      return;
    }

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION enforce_category_skill_same_company()
      RETURNS trigger AS $$
      DECLARE
        category_company UUID;
        skill_company UUID;
      BEGIN
        IF NEW.category_id IS NULL OR NEW.skill_id IS NULL THEN
          RETURN NEW;
        END IF;

        SELECT company_id INTO category_company FROM categories WHERE id = NEW.category_id;
        SELECT company_id INTO skill_company FROM skills WHERE id = NEW.skill_id;

        IF category_company IS NULL THEN
          RAISE EXCEPTION 'Unknown category % for category_skills', NEW.category_id;
        END IF;
        IF skill_company IS NULL THEN
          RAISE EXCEPTION 'Unknown skill % for category_skills', NEW.skill_id;
        END IF;

        IF category_company <> skill_company THEN
          RAISE EXCEPTION 'Category % and skill % belong to different companies', NEW.category_id, NEW.skill_id;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_enforce_category_skill_same_company ON category_skills;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_enforce_category_skill_same_company
      BEFORE INSERT OR UPDATE ON category_skills
      FOR EACH ROW
      EXECUTE FUNCTION enforce_category_skill_same_company();
    `);
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_enforce_category_skill_same_company ON category_skills;
    `);

    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS enforce_category_skill_same_company();
    `);
  },
};
