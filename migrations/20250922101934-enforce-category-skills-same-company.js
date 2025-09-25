'use strict';

module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      console.warn(
        '[migration] Skipping category_skills tenant guard for dialect',
        dialect,
      );
      return;
    }

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION enforce_same_company_for_category_skill()
      RETURNS trigger AS $$
      DECLARE
        cat_company UUID;
        skl_company UUID;
      BEGIN
        SELECT company_id INTO cat_company FROM categories WHERE id = NEW.category_id;
        SELECT company_id INTO skl_company FROM skills WHERE id = NEW.skill_id;
        IF cat_company IS NULL OR skl_company IS NULL OR cat_company <> skl_company THEN
          RAISE EXCEPTION 'Category and Skill must belong to same Company';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_cat_skill_same_company ON category_skills;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_cat_skill_same_company
      BEFORE INSERT OR UPDATE ON category_skills
      FOR EACH ROW EXECUTE FUNCTION enforce_same_company_for_category_skill();
    `);
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_cat_skill_same_company ON category_skills;
    `);

    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS enforce_same_company_for_category_skill();
    `);
  },
};
