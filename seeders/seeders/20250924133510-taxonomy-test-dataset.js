'use strict';

const IDS = {
  company: '00000000-0000-0000-0000-0000000000AA',
  hvac: '00000000-0000-0000-0000-0000000000AB',
  electrical: '00000000-0000-0000-0000-0000000000AC',
  cooling: '00000000-0000-0000-0000-0000000000AD',
  wiring: '00000000-0000-0000-0000-0000000000AE',
  audit: '00000000-0000-0000-0000-0000000000AF',
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('companies', [
      { id: IDS.company, name: 'Taxonomy QA Co', created_at: now },
    ]);

    await queryInterface.bulkInsert('categories', [
      { id: IDS.hvac, company_id: IDS.company, key: 'hvac', label: 'HVAC' },
      {
        id: IDS.electrical,
        company_id: IDS.company,
        key: 'electrical',
        label: 'Electrical',
      },
    ]);

    await queryInterface.bulkInsert('skills', [
      {
        id: IDS.cooling,
        company_id: IDS.company,
        key: 'cooling',
        label: 'Cooling',
      },
      {
        id: IDS.wiring,
        company_id: IDS.company,
        key: 'wiring',
        label: 'Wiring',
      },
      { id: IDS.audit, company_id: IDS.company, key: 'audit', label: 'Audit' },
    ]);

    await queryInterface.bulkInsert('category_skills', [
      { category_id: IDS.hvac, skill_id: IDS.cooling },
      { category_id: IDS.hvac, skill_id: IDS.audit },
      { category_id: IDS.electrical, skill_id: IDS.wiring },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('category_skills', {
      skill_id: [IDS.cooling, IDS.wiring, IDS.audit],
    });
    await queryInterface.bulkDelete('skills', {
      id: [IDS.cooling, IDS.wiring, IDS.audit],
    });
    await queryInterface.bulkDelete('categories', {
      id: [IDS.hvac, IDS.electrical],
    });
    await queryInterface.bulkDelete('companies', { id: IDS.company });
  },
};
