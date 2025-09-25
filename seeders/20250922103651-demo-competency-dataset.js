'use strict';

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert(
        'companies',
        [
          {
            id: '11111111-aaaa-4bbb-8ccc-000000000001',
            name: 'Acme Facilities',
            created_at: new Date(),
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'sites',
        [
          {
            id: '22222222-bbbb-4ccc-8ddd-000000000002',
            company_id: '11111111-aaaa-4bbb-8ccc-000000000001',
            code: 'HQ',
            name: 'Headquarters Campus',
            timezone: 'Europe/Paris',
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'buildings',
        [
          {
            id: '33333333-cccc-4ddd-8eee-000000000003',
            site_id: '22222222-bbbb-4ccc-8ddd-000000000002',
            code: 'A',
            name: 'Building A',
          },
          {
            id: '33333333-cccc-4ddd-8eee-000000000004',
            site_id: '22222222-bbbb-4ccc-8ddd-000000000002',
            code: 'B',
            name: 'Building B',
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'teams',
        [
          {
            id: '44444444-dddd-4eee-8fff-000000000005',
            company_id: '11111111-aaaa-4bbb-8ccc-000000000001',
            name: 'Day Shift Maintenance',
            type: 'internal',
            active: true,
          },
          {
            id: '44444444-dddd-4eee-8fff-000000000006',
            company_id: '11111111-aaaa-4bbb-8ccc-000000000001',
            name: 'Night Response Crew',
            type: 'internal',
            active: true,
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'categories',
        [
          {
            id: '55555555-eeee-4fff-8000-000000000007',
            company_id: '11111111-aaaa-4bbb-8ccc-000000000001',
            key: 'cleaning',
            label: 'Cleaning & Housekeeping',
          },
          {
            id: '55555555-eeee-4fff-8000-000000000008',
            company_id: '11111111-aaaa-4bbb-8ccc-000000000001',
            key: 'network',
            label: 'Network & Connectivity',
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'skills',
        [
          {
            id: '66666666-ffff-4000-8111-000000000009',
            company_id: '11111111-aaaa-4bbb-8ccc-000000000001',
            key: 'cleaning-basic',
            label: 'Cleaning basics',
          },
          {
            id: '66666666-ffff-4000-8111-000000000010',
            company_id: '11111111-aaaa-4bbb-8ccc-000000000001',
            key: 'network-l1',
            label: 'Network L1 support',
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'category_skills',
        [
          {
            category_id: '55555555-eeee-4fff-8000-000000000007',
            skill_id: '66666666-ffff-4000-8111-000000000009',
          },
          {
            category_id: '55555555-eeee-4fff-8000-000000000008',
            skill_id: '66666666-ffff-4000-8111-000000000010',
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'contracts',
        [
          {
            id: '77777777-0000-4111-8222-000000000011',
            site_id: '22222222-bbbb-4ccc-8ddd-000000000002',
            name: 'HQ Facility Services',
            active: true,
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'contract_versions',
        [
          {
            id: '77777777-0000-4111-8222-000000000012',
            contract_id: '77777777-0000-4111-8222-000000000011',
            version: 1,
            coverage: JSON.stringify({
              cleaning: { response: '2h', resolution: '8h' },
              network: { response: '1h', resolution: '4h' },
            }),
            escalation: JSON.stringify({}),
            approvals: JSON.stringify({}),
            created_at: new Date(),
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'contract_categories',
        [
          {
            id: '88888888-1111-4222-8333-000000000013',
            contract_version_id: '77777777-0000-4111-8222-000000000012',
            category_id: '55555555-eeee-4fff-8000-000000000007',
            included: true,
            sla: JSON.stringify({ priority: 'P2', ack: '2h', resolve: '8h' }),
          },
          {
            id: '88888888-1111-4222-8333-000000000014',
            contract_version_id: '77777777-0000-4111-8222-000000000012',
            category_id: '55555555-eeee-4fff-8000-000000000008',
            included: true,
            sla: JSON.stringify({ priority: 'P1', ack: '1h', resolve: '4h' }),
          },
        ],
        { transaction },
      );

      await queryInterface.bulkInsert(
        'competency_matrix',
        [
          {
            id: '99999999-2222-4333-8444-000000000015',
            contract_version_id: '77777777-0000-4111-8222-000000000012',
            team_id: '44444444-dddd-4eee-8fff-000000000005',
            category_id: '55555555-eeee-4fff-8000-000000000007',
            building_id: '33333333-cccc-4ddd-8eee-000000000003',
            level: 'primary',
            window: 'business_hours',
          },
          {
            id: '99999999-2222-4333-8444-000000000016',
            contract_version_id: '77777777-0000-4111-8222-000000000012',
            team_id: '44444444-dddd-4eee-8fff-000000000006',
            category_id: '55555555-eeee-4fff-8000-000000000007',
            building_id: null,
            level: 'backup',
            window: 'after_hours',
          },
          {
            id: '99999999-2222-4333-8444-000000000017',
            contract_version_id: '77777777-0000-4111-8222-000000000012',
            team_id: '44444444-dddd-4eee-8fff-000000000006',
            category_id: '55555555-eeee-4fff-8000-000000000008',
            building_id: null,
            level: 'primary',
            window: 'any',
          },
        ],
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    const { Op } = queryInterface.sequelize.constructor;
    try {
      await queryInterface.bulkDelete(
        'competency_matrix',
        {
          id: {
            [Op.in]: [
              '99999999-2222-4333-8444-000000000015',
              '99999999-2222-4333-8444-000000000016',
              '99999999-2222-4333-8444-000000000017',
            ],
          },
        },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'contract_categories',
        {
          id: {
            [Op.in]: [
              '88888888-1111-4222-8333-000000000013',
              '88888888-1111-4222-8333-000000000014',
            ],
          },
        },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'contract_versions',
        { id: '77777777-0000-4111-8222-000000000012' },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'contracts',
        { id: '77777777-0000-4111-8222-000000000011' },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'category_skills',
        {
          category_id: {
            [Op.in]: [
              '55555555-eeee-4fff-8000-000000000007',
              '55555555-eeee-4fff-8000-000000000008',
            ],
          },
        },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'skills',
        {
          id: {
            [Op.in]: [
              '66666666-ffff-4000-8111-000000000009',
              '66666666-ffff-4000-8111-000000000010',
            ],
          },
        },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'categories',
        {
          id: {
            [Op.in]: [
              '55555555-eeee-4fff-8000-000000000007',
              '55555555-eeee-4fff-8000-000000000008',
            ],
          },
        },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'teams',
        {
          id: {
            [Op.in]: [
              '44444444-dddd-4eee-8fff-000000000005',
              '44444444-dddd-4eee-8fff-000000000006',
            ],
          },
        },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'buildings',
        {
          id: {
            [Op.in]: [
              '33333333-cccc-4ddd-8eee-000000000003',
              '33333333-cccc-4ddd-8eee-000000000004',
            ],
          },
        },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'sites',
        { id: '22222222-bbbb-4ccc-8ddd-000000000002' },
        { transaction },
      );

      await queryInterface.bulkDelete(
        'companies',
        { id: '11111111-aaaa-4bbb-8ccc-000000000001' },
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
