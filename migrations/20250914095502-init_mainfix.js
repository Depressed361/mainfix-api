// migrations/XXXXXXXXXXXXXX-init_mainfix.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const {
      UUID,
      UUIDV4,
      TEXT,
      BOOLEAN,
      DATE,
      DATEONLY,
      INTEGER,
      BIGINT,
      SMALLINT,
      JSONB,
      JSON,
      DECIMAL,
      ENUM,
      CHAR,
    } = Sequelize;
    // Enable citext on Postgres (safe no-op on other dialects) and set JSON type fallback
    const isPostgres =
      queryInterface.sequelize.getDialect &&
      queryInterface.sequelize.getDialect() === 'postgres';
    if (isPostgres) {
      await queryInterface.sequelize.query(
        'CREATE EXTENSION IF NOT EXISTS citext',
      );
    }
    const JSON_TYPE = isPostgres ? JSONB : JSON;
    const EMAIL_TYPE = isPostgres && Sequelize.CITEXT ? Sequelize.CITEXT : TEXT;
    // 1) Core reference tables
    await queryInterface.createTable('companies', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      name: { type: TEXT, allowNull: false },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.createTable('categories', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      company_id: { type: UUID, allowNull: false },
      key: { type: TEXT, allowNull: false },
      label: { type: TEXT, allowNull: false },
    });
    await queryInterface.addConstraint('categories', {
      fields: ['company_id', 'key'],
      type: 'unique',
      name: 'categories_company_key_unique',
    });
    await queryInterface.createTable('skills', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      company_id: { type: UUID, allowNull: false },
      key: { type: TEXT, allowNull: false },
      label: { type: TEXT, allowNull: false },
    });
    await queryInterface.addConstraint('skills', {
      fields: ['company_id', 'key'],
      type: 'unique',
      name: 'skills_company_key_unique',
    });
    // 2) Catalog: sites, buildings, locations, assets
    await queryInterface.createTable('sites', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      company_id: { type: UUID, allowNull: false },
      code: { type: TEXT, allowNull: false },
      name: { type: TEXT, allowNull: false },
      timezone: { type: TEXT, allowNull: false, defaultValue: 'Europe/Paris' },
    });
    await queryInterface.addConstraint('sites', {
      fields: ['company_id', 'code'],
      type: 'unique',
      name: 'sites_company_code_unique',
    });
    await queryInterface.createTable('buildings', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      site_id: { type: UUID, allowNull: false },
      code: { type: TEXT, allowNull: false },
      name: { type: TEXT, allowNull: false },
    });
    await queryInterface.addConstraint('buildings', {
      fields: ['site_id', 'code'],
      type: 'unique',
      name: 'buildings_site_code_unique',
    });
    await queryInterface.createTable('locations', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      building_id: { type: UUID, allowNull: false },
      code: { type: TEXT, allowNull: false },
      description: { type: TEXT },
    });
    await queryInterface.addConstraint('locations', {
      fields: ['building_id', 'code'],
      type: 'unique',
      name: 'locations_building_code_unique',
    });
    await queryInterface.createTable('assets', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      company_id: { type: UUID, allowNull: false },
      location_id: { type: UUID, allowNull: true },
      code: { type: TEXT, allowNull: false },
      kind: { type: TEXT },
      metadata: { type: JSON_TYPE },
    });
    await queryInterface.addConstraint('assets', {
      fields: ['company_id', 'code'],
      type: 'unique',
      name: 'assets_company_code_unique',
    });
    // 3) Directory: users, teams, team_members
    await queryInterface.createTable('users', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      company_id: { type: UUID, allowNull: false },
      passwordHash: { type: TEXT, allowNull: false },
      email: { type: EMAIL_TYPE, allowNull: false, unique: true },
      site_id: { type: UUID, allowNull: true },
      display_name: { type: TEXT, allowNull: false },
      role: {
        type: ENUM('occupant', 'maintainer', 'manager', 'approver', 'admin'),
        allowNull: false,
      },
      active: { type: BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.createTable('teams', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      company_id: { type: UUID, allowNull: false },
      name: { type: TEXT, allowNull: false },
      type: { type: ENUM('internal', 'vendor'), allowNull: false },
      active: { type: BOOLEAN, allowNull: false, defaultValue: true },
    });
    await queryInterface.createTable('team_members', {
      team_id: { type: UUID, allowNull: false },
      user_id: { type: UUID, allowNull: false },
    });
    await queryInterface.addConstraint('team_members', {
      fields: ['team_id', 'user_id'],
      type: 'primary key',
      name: 'pk_team_members',
    });
    // 4) Contracts and routing
    await queryInterface.createTable('contracts', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      site_id: { type: UUID, allowNull: false },
      name: { type: TEXT, allowNull: false },
      active: { type: BOOLEAN, allowNull: false, defaultValue: true },
    });
    await queryInterface.createTable('contract_versions', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      contract_id: { type: UUID, allowNull: false },
      version: { type: INTEGER, allowNull: false },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
      coverage: { type: JSON_TYPE, allowNull: false },
      escalation: { type: JSON_TYPE },
      approvals: { type: JSON_TYPE },
    });
    await queryInterface.addConstraint('contract_versions', {
      fields: ['contract_id', 'version'],
      type: 'unique',
      name: 'contract_versions_unique',
    });
    await queryInterface.createTable('contract_categories', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      contract_version_id: { type: UUID, allowNull: false },
      category_id: { type: UUID, allowNull: false },
      included: { type: BOOLEAN, allowNull: false, defaultValue: true },
      sla: { type: JSON_TYPE, allowNull: false },
    });
    await queryInterface.createTable('routing_rules', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      contract_version_id: { type: UUID, allowNull: false },
      priority: { type: INTEGER, allowNull: false, defaultValue: 100 },
      condition: { type: JSON_TYPE, allowNull: false },
      action: { type: JSON_TYPE, allowNull: false },
    });
    // 5) Taxonomy relationships
    await queryInterface.createTable('category_skills', {
      category_id: { type: UUID, allowNull: false },
      skill_id: { type: UUID, allowNull: false },
    });
    await queryInterface.addConstraint('category_skills', {
      fields: ['category_id', 'skill_id'],
      type: 'primary key',
      name: 'pk_category_skills',
    });
    // 6) Tickets and linked resources
    await queryInterface.createTable('tickets', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      company_id: { type: UUID, allowNull: false },
      site_id: { type: UUID, allowNull: false },
      building_id: { type: UUID },
      location_id: { type: UUID },
      category_id: { type: UUID, allowNull: false },
      asset_id: { type: UUID },
      reporter_id: { type: UUID, allowNull: false },
      assignee_team_id: { type: UUID },
      ergonomie: { type: TEXT },
      priority: { type: ENUM('P1', 'P2', 'P3'), allowNull: false },
      status: {
        type: ENUM(
          'draft', // Temporarily disabled
          'open',
          'assigned',
          'in_progress',
          'awaiting_confirmation',
          'resolved',
          'closed',
          'cancelled',
        ),
        allowNull: false,
        defaultValue: 'draft',
      },
      title: { type: TEXT },
      description: { type: TEXT },
      photos: { type: JSON_TYPE },
      sla_ack_deadline: { type: DATE },
      sla_resolve_deadline: { type: DATE },
      ack_at: { type: DATE },
      resolved_at: { type: DATE },
      contract_id: { type: UUID },
      contract_version: { type: INTEGER },
      contract_snapshot: { type: JSON_TYPE },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.createTable('ticket_events', {
      id: { type: BIGINT, primaryKey: true, autoIncrement: true },
      ticket_id: { type: UUID, allowNull: false },
      actor_user_id: { type: UUID },
      type: { type: TEXT, allowNull: false },
      payload: { type: JSON_TYPE },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.createTable('ticket_comments', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      author_user_id: { type: UUID, allowNull: false },
      body: { type: TEXT, allowNull: false },
      is_internal: { type: BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.createTable('ticket_attachments', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      key: { type: TEXT, allowNull: false },
      mime_type: { type: TEXT },
      size_bytes: { type: INTEGER },
      uploaded_by: { type: UUID },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.createTable('ticket_links', {
      parent_ticket_id: { type: UUID, allowNull: false },
      child_ticket_id: { type: UUID, allowNull: false },
      relation: { type: ENUM('duplicate', 'related', 'parent-child') },
    });
    await queryInterface.addConstraint('ticket_links', {
      fields: ['parent_ticket_id', 'child_ticket_id'],
      type: 'primary key',
      name: 'pk_ticket_links',
    });
    // 7) Cost
    await queryInterface.createTable('ticket_costs', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      labor_hours: { type: DECIMAL(6, 2) },
      labor_rate: { type: DECIMAL(10, 2) },
      parts_cost: { type: DECIMAL(10, 2) },
      total: { type: DECIMAL(12, 2) },
      currency: { type: CHAR(3), allowNull: false, defaultValue: 'EUR' },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.createTable('ticket_parts', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      sku: { type: TEXT },
      label: { type: TEXT },
      qty: { type: DECIMAL(10, 2) },
      unit_cost: { type: DECIMAL(10, 2) },
    });
    // 8) SLA
    await queryInterface.createTable('sla_targets', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      kind: { type: ENUM('ack', 'resolve'), allowNull: false },
      deadline: { type: DATE, allowNull: false },
      paused: { type: BOOLEAN, allowNull: false, defaultValue: false },
      paused_at: { type: DATE },
    });
    await queryInterface.createTable('sla_breaches', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      sla_target_id: { type: UUID, allowNull: false },
      breached_at: { type: DATE, allowNull: false },
      level: { type: INTEGER, allowNull: false },
      notified: { type: BOOLEAN, allowNull: false, defaultValue: false },
    });
    // 9) Approvals
    await queryInterface.createTable('approval_requests', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      reason: { type: TEXT },
      amount_estimate: { type: DECIMAL(12, 2) },
      currency: { type: CHAR(3), allowNull: false, defaultValue: 'EUR' },
      status: {
        type: ENUM('PENDING', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    // 10) Satisfaction
    await queryInterface.createTable('satisfaction_surveys', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      respondent_user_id: { type: UUID, allowNull: false },
      rating: { type: SMALLINT, allowNull: false },
      comment: { type: TEXT },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addConstraint('satisfaction_surveys', {
      fields: ['ticket_id', 'respondent_user_id'],
      type: 'unique',
      name: 'uniq_satisfaction_ticket_respondent',
    });
    // 11) Calendar
    await queryInterface.createTable('holiday_calendars', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      code: { type: TEXT, allowNull: false, unique: true },
      country: { type: TEXT },
    });
    await queryInterface.createTable('holidays', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      calendar_id: { type: UUID },
      day: { type: DATEONLY, allowNull: false },
      label: { type: TEXT },
    });
    // 12) Competency
    await queryInterface.createTable('team_zones', {
      team_id: { type: UUID, allowNull: false },
      building_id: { type: UUID, allowNull: false },
    });
    await queryInterface.addConstraint('team_zones', {
      fields: ['team_id', 'building_id'],
      type: 'primary key',
      name: 'pk_team_zones',
    });
    await queryInterface.createTable('team_skills', {
      team_id: { type: UUID, allowNull: false },
      skill_id: { type: UUID, allowNull: false },
    });
    await queryInterface.addConstraint('team_skills', {
      fields: ['team_id', 'skill_id'],
      type: 'primary key',
      name: 'pk_team_skills',
    });
    await queryInterface.createTable('competency_matrix', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      contract_version_id: { type: UUID, allowNull: false },
      team_id: { type: UUID, allowNull: false },
      category_id: { type: UUID, allowNull: false },
      building_id: { type: UUID },
      level: { type: ENUM('primary', 'backup'), allowNull: false },
      window: {
        type: ENUM('business_hours', 'after_hours', 'any'),
        allowNull: false,
      },
    });
    await queryInterface.addConstraint('competency_matrix', {
      fields: [
        'contract_version_id',
        'team_id',
        'category_id',
        'building_id',
        'window',
      ],
      type: 'unique',
      name: 'competency_unique',
    });
    // 13) Comfort
    await queryInterface.createTable('comfort_rules', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      site_id: { type: UUID, allowNull: false },
      type: {
        type: ENUM('temperature', 'noise', 'illuminance', 'air_quality'),
        allowNull: false,
      },
      threshold_op: {
        type: ENUM('>', '>=', '<', '<=', 'between'),
        allowNull: false,
      },
      threshold_low: { type: DECIMAL(10, 2) },
      threshold_high: { type: DECIMAL(10, 2) },
      window: {
        type: ENUM('business_hours', 'after_hours', 'any'),
        allowNull: false,
        defaultValue: 'any',
      },
      category_id: { type: UUID, allowNull: false },
      active: { type: BOOLEAN, allowNull: false, defaultValue: true },
    });
    await queryInterface.createTable('comfort_indicators', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      location_id: { type: UUID, allowNull: false },
      type: {
        type: ENUM('temperature', 'noise', 'illuminance', 'air_quality'),
        allowNull: false,
      },
      value: { type: DECIMAL(10, 2), allowNull: false },
      unit: { type: TEXT, allowNull: false },
      measured_at: { type: DATE, allowNull: false },
      source: { type: ENUM('iot', 'manual'), allowNull: false },
      sensor_id: { type: TEXT },
      metadata: { type: JSON_TYPE },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    // 14) Well-being
    await queryInterface.createTable('well_being_scores', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      site_id: { type: UUID, allowNull: false },
      period_start: { type: DATEONLY, allowNull: false },
      period_end: { type: DATEONLY, allowNull: false },
      average_rating: { type: DECIMAL(3, 2), allowNull: false },
      nb_surveys: { type: INTEGER, allowNull: false },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addConstraint('well_being_scores', {
      fields: ['site_id', 'period_start', 'period_end'],
      type: 'unique',
      name: 'site_period_unique',
    });
  },
  async down(queryInterface, Sequelize) {
    // Drop in reverse dependency order
    await queryInterface.dropTable('well_being_scores');
    await queryInterface.dropTable('comfort_indicators');
    await queryInterface.dropTable('comfort_rules');
    await queryInterface.dropTable('competency_matrix');
    await queryInterface.dropTable('team_skills');
    await queryInterface.dropTable('team_zones');
    await queryInterface.dropTable('holidays');
    await queryInterface.dropTable('holiday_calendars');
    await queryInterface.dropTable('satisfaction_surveys');
    await queryInterface.dropTable('approval_requests');
    await queryInterface.dropTable('sla_breaches');
    await queryInterface.dropTable('sla_targets');
    await queryInterface.dropTable('ticket_parts');
    await queryInterface.dropTable('ticket_costs');
    await queryInterface.dropTable('ticket_links');
    await queryInterface.dropTable('ticket_attachments');
    await queryInterface.dropTable('ticket_comments');
    await queryInterface.dropTable('ticket_events');
    await queryInterface.dropTable('tickets');
    await queryInterface.dropTable('category_skills');
    await queryInterface.dropTable('routing_rules');
    await queryInterface.dropTable('contract_categories');
    await queryInterface.dropTable('contract_versions');
    await queryInterface.dropTable('contracts');
    await queryInterface.dropTable('team_members');
    await queryInterface.dropTable('teams');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('assets');
    await queryInterface.dropTable('locations');
    await queryInterface.dropTable('buildings');
    await queryInterface.dropTable('sites');
    await queryInterface.dropTable('skills');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('companies');
  },
};
