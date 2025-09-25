"use strict";

module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      console.warn('[migration] Skipping competency_matrix integrity trigger for dialect', dialect);
      return;
    }

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION enforce_competency_matrix_integrity()
      RETURNS trigger AS $$
      DECLARE
        v_site_id     UUID;
        v_company_id  UUID;
        v_team_co     UUID;
        v_cat_co      UUID;
        v_build_site  UUID;
      BEGIN
        SELECT c.site_id, s.company_id
          INTO v_site_id, v_company_id
        FROM contract_versions cv
        JOIN contracts c ON c.id = cv.contract_id
        JOIN sites     s ON s.id = c.site_id
        WHERE cv.id = NEW.contract_version_id;

        IF v_site_id IS NULL THEN
          RAISE EXCEPTION 'ContractVersion % not bound to a site', NEW.contract_version_id;
        END IF;

        SELECT company_id INTO v_team_co FROM teams WHERE id = NEW.team_id;
        IF v_team_co IS NULL OR v_team_co <> v_company_id THEN
          RAISE EXCEPTION 'Team % belongs to a different company than contract''s site', NEW.team_id;
        END IF;

        SELECT company_id INTO v_cat_co FROM categories WHERE id = NEW.category_id;
        IF v_cat_co IS NULL OR v_cat_co <> v_company_id THEN
          RAISE EXCEPTION 'Category % belongs to a different company than contract''s site', NEW.category_id;
        END IF;

        IF NEW.building_id IS NOT NULL THEN
          SELECT site_id INTO v_build_site FROM buildings WHERE id = NEW.building_id;
          IF v_build_site IS NULL OR v_build_site <> v_site_id THEN
            RAISE EXCEPTION 'Building % not part of the same site as the contract', NEW.building_id;
          END IF;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_competency_matrix_integrity ON competency_matrix;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_competency_matrix_integrity
      BEFORE INSERT OR UPDATE ON competency_matrix
      FOR EACH ROW
      EXECUTE FUNCTION enforce_competency_matrix_integrity();
    `);
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') return;

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_competency_matrix_integrity ON competency_matrix;
    `);

    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS enforce_competency_matrix_integrity();
    `);
  },
};
