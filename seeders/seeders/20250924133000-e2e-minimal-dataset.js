'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // IDs stables pour les E2E (lisibles dans vos tests)
    const ids = {
      company: '00000000-0000-0000-0000-000000000001',
      vendorCompany: '00000000-0000-0000-0000-000000000002',

      site: '00000000-0000-0000-0000-000000000011',
      building: '00000000-0000-0000-0000-000000000012',
      location: '00000000-0000-0000-0000-000000000013',

      catHVAC: '00000000-0000-0000-0000-000000000021',
      catPlumbing: '00000000-0000-0000-0000-000000000022',
      skillCooling: '00000000-0000-0000-0000-000000000031',
      skillHydraulic: '00000000-0000-0000-0000-000000000032',

      internalTeam: '00000000-0000-0000-0000-000000000041',
      vendorTeam: '00000000-0000-0000-0000-000000000042',

      adminUser: '00000000-0000-0000-0000-000000000051',
      managerUser: '00000000-0000-0000-0000-000000000052',
      techUser: '00000000-0000-0000-0000-000000000053',

      contract: '00000000-0000-0000-0000-000000000061',
      contractV1: '00000000-0000-0000-0000-000000000062',

      contractCatHVAC: '00000000-0000-0000-0000-000000000071',
      contractCatPlb: '00000000-0000-0000-0000-000000000072',

      ruleBizHours: '00000000-0000-0000-0000-000000000081',
      ruleAfterHours: '00000000-0000-0000-0000-000000000082',

      competency1: '00000000-0000-0000-0000-000000000091',
      competency2: '00000000-0000-0000-0000-000000000092',
    };

    // 1) Companies
    await queryInterface.bulkInsert('companies', [
      { id: ids.company, name: 'Demo ClientCo', created_at: now },
      { id: ids.vendorCompany, name: 'Demo VendorCo', created_at: now },
    ]);

    // 2) Site/Building/Location
    await queryInterface.bulkInsert('sites', [
      {
        id: ids.site,
        company_id: ids.company,
        code: 'PAR-HQ',
        name: 'Paris HQ',
        timezone: 'Europe/Paris',
      },
    ]);
    await queryInterface.bulkInsert('buildings', [
      { id: ids.building, site_id: ids.site, code: 'B1', name: 'HQ Tower' },
    ]);
    await queryInterface.bulkInsert('locations', [
      {
        id: ids.location,
        building_id: ids.building,
        code: 'F01-101',
        description: 'Etage 1 - Local technique',
      },
    ]);

    // 3) Taxonomy
    await queryInterface.bulkInsert('categories', [
      {
        id: ids.catHVAC,
        company_id: ids.company,
        key: 'hvac',
        label: 'CVC / HVAC',
      },
      {
        id: ids.catPlumbing,
        company_id: ids.company,
        key: 'plumb',
        label: 'Plomberie',
      },
    ]);
    await queryInterface.bulkInsert('skills', [
      {
        id: ids.skillCooling,
        company_id: ids.company,
        key: 'cooling',
        label: 'Froid/Clim',
      },
      {
        id: ids.skillHydraulic,
        company_id: ids.company,
        key: 'hydraulic',
        label: 'Hydraulique',
      },
    ]);
    await queryInterface.bulkInsert('category_skills', [
      { category_id: ids.catHVAC, skill_id: ids.skillCooling },
      { category_id: ids.catPlumbing, skill_id: ids.skillHydraulic },
    ]);

    // 4) Users (hashs fictifs), Teams & membres
    await queryInterface.bulkInsert('users', [
      {
        id: ids.adminUser,
        company_id: ids.company,
        passwordHash: 'hash',
        email: 'admin@clientco.test',
        site_id: ids.site,
        display_name: 'Admin Client',
        role: 'admin',
        active: true,
        created_at: now,
      },
      {
        id: ids.managerUser,
        company_id: ids.company,
        passwordHash: 'hash',
        email: 'manager@clientco.test',
        site_id: ids.site,
        display_name: 'FM Manager',
        role: 'manager',
        active: true,
        created_at: now,
      },
      {
        id: ids.techUser,
        company_id: ids.company,
        passwordHash: 'hash',
        email: 'tech@clientco.test',
        site_id: ids.site,
        display_name: 'Maintainer One',
        role: 'maintainer',
        active: true,
        created_at: now,
      },
    ]);

    await queryInterface.bulkInsert('teams', [
      {
        id: ids.internalTeam,
        company_id: ids.company,
        name: 'Team Interne HVAC',
        type: 'internal',
        active: true,
      },
      // Prestataire: company différente
      {
        id: ids.vendorTeam,
        company_id: ids.vendorCompany,
        name: 'Vendor Team Plomberie',
        type: 'vendor',
        active: true,
      },
    ]);

    await queryInterface.bulkInsert('team_members', [
      { team_id: ids.internalTeam, user_id: ids.techUser },
    ]);

    // Zones & Skills
    await queryInterface.bulkInsert('team_zones', [
      { team_id: ids.internalTeam, building_id: ids.building },
      { team_id: ids.vendorTeam, building_id: ids.building },
    ]);
    await queryInterface.bulkInsert('team_skills', [
      { team_id: ids.internalTeam, skill_id: ids.skillCooling },
      { team_id: ids.vendorTeam, skill_id: ids.skillHydraulic },
    ]);

    // 5) Contrat + Version (avec provider_company_id pour autoriser vendor côté matrice)
    // NB: provider_company_id est optionnel mais utile si sous-traité. (Voir trigger competency)
    await queryInterface.bulkInsert('contracts', [
      {
        id: ids.contract,
        site_id: ids.site,
        name: 'FM Contract HQ',
        active: true,
        provider_company_id: ids.vendorCompany,
      },
    ]);

    // Coverage/SLA (ex: P1 ack 1h, resolve 4h ; P2 ack 4h, resolve 24h)
    const coverage = {
      business_hours: { start: '08:00', end: '18:00', tz: 'Europe/Paris' },
      priorities: {
        P1: { ack_mins: 60, resolve_mins: 240 },
        P2: { ack_mins: 240, resolve_mins: 1440 },
        P3: { ack_mins: 480, resolve_mins: 2880 },
      },
    };
    const escalation = {
      levels: [
        { after_mins_overdue: 30, notify_roles: ['manager'] },
        { after_mins_overdue: 120, notify_roles: ['admin'] },
      ],
    };
    const approvals = {
      thresholds: [{ currency: 'EUR', max: 500, approver_role: 'manager' }],
    };

    await queryInterface.bulkInsert('contract_versions', [
      {
        id: ids.contractV1,
        contract_id: ids.contract,
        version: 1,
        created_at: now,
        coverage,
        escalation,
        approvals,
      },
    ]);

    // Contract categories (intégrité: catégorie doit appartenir à la même company que le site du contrat)
    await queryInterface.bulkInsert('contract_categories', [
      {
        id: ids.contractCatHVAC,
        contract_version_id: ids.contractV1,
        category_id: ids.catHVAC,
        included: true,
        sla: { P1: { ack_mins: 60, resolve_mins: 240 } },
      },
      {
        id: ids.contractCatPlb,
        contract_version_id: ids.contractV1,
        category_id: ids.catPlumbing,
        included: true,
        sla: { P2: { ack_mins: 240, resolve_mins: 1440 } },
      },
    ]);

    // Routing rules (priorité croissante = plus prioritaire)
    await queryInterface.bulkInsert('routing_rules', [
      {
        id: ids.ruleBizHours,
        contract_version_id: ids.contractV1,
        priority: 10,
        condition: { window: 'business_hours' },
        action: { assign_team_id: ids.internalTeam },
      },
      {
        id: ids.ruleAfterHours,
        contract_version_id: ids.contractV1,
        priority: 20,
        condition: { window: 'after_hours' },
        action: { assign_team_id: ids.vendorTeam },
      },
    ]);

    // 6) Competency matrix (valide par triggers/constraints)
    // - Interne: HVAC primaire sur B1 en business_hours
    // - Vendor:  Plomberie primaire sur B1 en after_hours (autorisé car provider_company_id = VendorCo)
    await queryInterface.bulkInsert('competency_matrix', [
      {
        id: ids.competency1,
        contract_version_id: ids.contractV1,
        team_id: ids.internalTeam,
        category_id: ids.catHVAC,
        building_id: ids.building,
        level: 'primary',
        window: 'business_hours',
      },
      {
        id: ids.competency2,
        contract_version_id: ids.contractV1,
        team_id: ids.vendorTeam,
        category_id: ids.catPlumbing,
        building_id: ids.building,
        level: 'primary',
        window: 'after_hours',
      },
    ]);

    // (Option) admin_scopes pour les tests d’ABAC
    // - Admin plateforme fictif : non requis ici
    // - Company admin sur Demo ClientCo
    await queryInterface.sequelize.query(`
      INSERT INTO admin_scopes (user_id, scope, company_id, created_at)
      VALUES ('${ids.adminUser}', 'company', '${ids.company}', NOW())
      ON CONFLICT DO NOTHING;
    `);
  },

  async down(queryInterface) {
    // Nettoyage simple par IDs (ordre inverse grossier)
    const t = (table, col = 'id', arr) =>
      queryInterface.bulkDelete(table, { [col]: arr }, {});

    const idsArr = (objKeys) => objKeys.map((k) => k);

    await t('admin_scopes', 'user_id', [
      '00000000-0000-0000-0000-000000000051',
    ]);
    await t('competency_matrix', 'id', [
      '00000000-0000-0000-0000-000000000091',
      '00000000-0000-0000-0000-000000000092',
    ]);
    await t('routing_rules', 'id', [
      '00000000-0000-0000-0000-000000000081',
      '00000000-0000-0000-0000-000000000082',
    ]);
    await t('contract_categories', 'id', [
      '00000000-0000-0000-0000-000000000071',
      '00000000-0000-0000-0000-000000000072',
    ]);
    await t('contract_versions', 'id', [
      '00000000-0000-0000-0000-000000000062',
    ]);
    await t('contracts', 'id', ['00000000-0000-0000-0000-000000000061']);

    await t('team_skills', 'team_id', [
      '00000000-0000-0000-0000-000000000041',
      '00000000-0000-0000-0000-000000000042',
    ]);
    await t('team_zones', 'team_id', [
      '00000000-0000-0000-0000-000000000041',
      '00000000-0000-0000-0000-000000000042',
    ]);
    await t('team_members', 'team_id', [
      '00000000-0000-0000-0000-000000000041',
    ]);
    await t('teams', 'id', [
      '00000000-0000-0000-0000-000000000041',
      '00000000-0000-0000-0000-000000000042',
    ]);

    await t('users', 'id', [
      '00000000-0000-0000-0000-000000000051',
      '00000000-0000-0000-0000-000000000052',
      '00000000-0000-0000-0000-000000000053',
    ]);

    await t('category_skills', 'category_id', [
      '00000000-0000-0000-0000-000000000021',
      '00000000-0000-0000-0000-000000000022',
    ]);
    await t('skills', 'id', [
      '00000000-0000-0000-0000-000000000031',
      '00000000-0000-0000-0000-000000000032',
    ]);
    await t('categories', 'id', [
      '00000000-0000-0000-0000-000000000021',
      '00000000-0000-0000-0000-000000000022',
    ]);

    await t('locations', 'id', ['00000000-0000-0000-0000-000000000013']);
    await t('buildings', 'id', ['00000000-0000-0000-0000-000000000012']);
    await t('sites', 'id', ['00000000-0000-0000-0000-000000000011']);

    await t('companies', 'id', [
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
    ]);
  },
};
