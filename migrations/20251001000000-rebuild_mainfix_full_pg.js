// migrations/20251001XXXXXX-rebuild_mainfix_full_pg.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const {
      UUID,
      UUIDV4,
      TEXT,
      STRING,
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
      CITEXT,
    } = Sequelize;

    // ──────────────────────────────────────────────────────────────────────────
    // Extensions Postgres (UUID + CITEXT)
    // ──────────────────────────────────────────────────────────────────────────
    const isPg =
      queryInterface.sequelize.getDialect &&
      queryInterface.sequelize.getDialect() === 'postgres';
    if (isPg) {
      await queryInterface.sequelize.query(
        'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
      ); // pour uuid_generate_v4()
      await queryInterface.sequelize.query(
        'CREATE EXTENSION IF NOT EXISTS citext',
      );
    }
    const JSON_TYPE = isPg ? JSONB : JSON;
    const EMAIL_TYPE = isPg && CITEXT ? CITEXT : TEXT;

    // ──────────────────────────────────────────────────────────────────────────
    // 1) Noyau référentiels (Company, Taxonomy)                             MCD
    // ──────────────────────────────────────────────────────────────────────────
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
    }); // :contentReference[oaicite:7]{index=7}

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
    }); // :contentReference[oaicite:8]{index=8}

    // ──────────────────────────────────────────────────────────────────────────
    // 2) Catalog (Site, Building, Location, Asset)                           MCD
    // ──────────────────────────────────────────────────────────────────────────
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

    // ──────────────────────────────────────────────────────────────────────────
    // 3) Directory (Users, Teams, Memberships, AdminScopes)                  MCD
    // ──────────────────────────────────────────────────────────────────────────
    await queryInterface.createTable('users', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      company_id: { type: UUID, allowNull: false },
      passwordHash: { type: STRING, allowNull: false },
      email: { type: EMAIL_TYPE, allowNull: false, unique: true }, // CITEXT unique
      site_id: { type: UUID, allowNull: true },
      display_name: { type: STRING, allowNull: false },
      role: {
        type: ENUM('occupant', 'maintainer', 'manager', 'approver', 'admin'),
        allowNull: false,
      }, // :contentReference[oaicite:9]{index=9}
      active: { type: BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable('teams', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      company_id: { type: UUID, allowNull: false },
      name: { type: TEXT, allowNull: false },
      type: { type: ENUM('internal', 'vendor'), allowNull: false }, // :contentReference[oaicite:10]{index=10}
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
    }); // cardinalité N↔N

    await queryInterface.createTable('team_skills', {
      team_id: { type: UUID, allowNull: false },
      skill_id: { type: UUID, allowNull: false },
    });
    await queryInterface.addConstraint('team_skills', {
      fields: ['team_id', 'skill_id'],
      type: 'primary key',
      name: 'pk_team_skills',
    }); // :contentReference[oaicite:11]{index=11}

    await queryInterface.createTable('team_zones', {
      team_id: { type: UUID, allowNull: false },
      building_id: { type: UUID, allowNull: false },
    });
    await queryInterface.addConstraint('team_zones', {
      fields: ['team_id', 'building_id'],
      type: 'primary key',
      name: 'pk_team_zones',
    }); // :contentReference[oaicite:12]{index=12}

    // Admin scopes (table sans PK formelle, + index utile) :contentReference[oaicite:13]{index=13}
    await queryInterface.createTable('admin_scopes', {
      user_id: { type: UUID, allowNull: false },
      scope: {
        type: ENUM('platform', 'company', 'site', 'building'),
        allowNull: false,
      },
      company_id: { type: UUID, allowNull: true },
      site_id: { type: UUID, allowNull: true },
      building_id: { type: UUID, allowNull: true },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('admin_scopes', {
      name: 'admin_scopes_user_scope_tuple',
      unique: false,
      fields: ['user_id', 'scope', 'company_id', 'site_id', 'building_id'],
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 4) Contracts, Versions, Categories, Routing                            MCD
    // ──────────────────────────────────────────────────────────────────────────
    await queryInterface.createTable('contracts', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      site_id: { type: UUID, allowNull: false },
      provider_company_id: { type: UUID, allowNull: true }, // vendor externe (optionnel) :contentReference[oaicite:14]{index=14}
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
    }); // :contentReference[oaicite:15]{index=15}

    await queryInterface.createTable('contract_categories', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      contract_version_id: { type: UUID, allowNull: false },
      category_id: { type: UUID, allowNull: false },
      included: { type: BOOLEAN, allowNull: false, defaultValue: true },
      sla: { type: JSON_TYPE, allowNull: false }, // JSON SLA par priorité
    }); // :contentReference[oaicite:16]{index=16}

    await queryInterface.createTable('routing_rules', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      contract_version_id: { type: UUID, allowNull: false },
      priority: { type: INTEGER, allowNull: false, defaultValue: 100 },
      condition: { type: JSON_TYPE, allowNull: false },
      action: { type: JSON_TYPE, allowNull: false },
    }); // :contentReference[oaicite:17]{index=17}

    // Matrice de compétences (contrat ⇄ team ⇄ catégorie ⇄ (building?)) :contentReference[oaicite:18]{index=18}
    await queryInterface.createTable('competency_matrix', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      contract_version_id: { type: UUID, allowNull: false },
      team_id: { type: UUID, allowNull: false },
      category_id: { type: UUID, allowNull: false },
      building_id: { type: UUID, allowNull: true },
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

    // Taxonomy bridge
    await queryInterface.createTable('category_skills', {
      category_id: { type: UUID, allowNull: false },
      skill_id: { type: UUID, allowNull: false },
    });
    await queryInterface.addConstraint('category_skills', {
      fields: ['category_id', 'skill_id'],
      type: 'primary key',
      name: 'pk_category_skills',
    }); // :contentReference[oaicite:19]{index=19}

    // ──────────────────────────────────────────────────────────────────────────
    // 5) Calendrier (jours fériés)                                           MCD
    // ──────────────────────────────────────────────────────────────────────────
    await queryInterface.createTable('holiday_calendars', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      code: { type: TEXT, allowNull: false, unique: true },
      country: { type: TEXT, allowNull: true },
    }); // :contentReference[oaicite:20]{index=20}

    await queryInterface.createTable('holidays', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      calendar_id: { type: UUID, allowNull: true },
      day: { type: DATEONLY, allowNull: false },
      label: { type: TEXT },
    }); // :contentReference[oaicite:21]{index=21}

    // ──────────────────────────────────────────────────────────────────────────
    // 6) Tickets & sous-ressources (events, comments, attachments, links…)  SQL
    // ──────────────────────────────────────────────────────────────────────────
    await queryInterface.createTable('tickets', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      number: { type: STRING(32), allowNull: false },

      company_id: { type: UUID, allowNull: false },
      site_id: { type: UUID, allowNull: false },
      building_id: { type: UUID, allowNull: true },
      location_id: { type: UUID, allowNull: true },

      category_id: { type: UUID, allowNull: false },
      asset_id: { type: UUID, allowNull: true },

      reporter_id: { type: UUID, allowNull: false },
      assignee_team_id: { type: UUID, allowNull: true },

      assigned_at: { type: DATE, allowNull: true },
      ergonomie: { type: TEXT, allowNull: true },

      priority: { type: ENUM('P1', 'P2', 'P3'), allowNull: false }, // :contentReference[oaicite:22]{index=22}
      status: {
        type: ENUM(
          'draft',
          'open',
          'assigned',
          'in_progress',
          'awaiting_confirmation',
          'resolved',
          'closed',
          'cancelled',
        ),
        allowNull: false,
        defaultValue: 'open', // aligné modèle
      }, // :contentReference[oaicite:23]{index=23}
      status_updated_at: { type: DATE, allowNull: true },

      title: { type: TEXT, allowNull: true },
      description: { type: TEXT, allowNull: true },
      photos: { type: JSON_TYPE, allowNull: true },

      sla_ack_deadline: { type: DATE, allowNull: true },
      sla_resolve_deadline: { type: DATE, allowNull: true },
      ack_at: { type: DATE, allowNull: true },
      resolved_at: { type: DATE, allowNull: true },

      contract_id: { type: UUID, allowNull: true },
      contract_version: { type: INTEGER, allowNull: true },
      contract_snapshot: { type: JSON_TYPE, allowNull: true },

      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('tickets', {
      fields: ['company_id', 'site_id', 'status'],
    });
    await queryInterface.addIndex('tickets', {
      fields: ['assignee_team_id', 'status', 'priority'],
    });
    await queryInterface.addIndex('tickets', { fields: ['sla_ack_deadline'] });
    await queryInterface.addIndex('tickets', {
      fields: ['sla_resolve_deadline'],
    }); // :contentReference[oaicite:24]{index=24}

    await queryInterface.createTable('ticket_events', {
      id: { type: BIGINT, primaryKey: true, autoIncrement: true },
      ticket_id: { type: UUID, allowNull: false },
      actor_user_id: { type: UUID, allowNull: true },
      type: { type: TEXT, allowNull: false }, // STATE_CHANGE, ASSIGN, COMMENT, SLA_BREACH,...
      payload: { type: JSON_TYPE, allowNull: true },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('ticket_events', {
      fields: ['ticket_id', 'created_at'],
    }); // :contentReference[oaicite:25]{index=25}

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
      mime_type: { type: TEXT, allowNull: true },
      size_bytes: { type: INTEGER, allowNull: true },
      uploaded_by: { type: UUID, allowNull: true },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable('ticket_links', {
      parent_ticket_id: { type: UUID, allowNull: false },
      child_ticket_id: { type: UUID, allowNull: false },
      relation: {
        type: ENUM('duplicate', 'related', 'parent-child'),
        allowNull: true,
      },
    });
    await queryInterface.addConstraint('ticket_links', {
      fields: ['parent_ticket_id', 'child_ticket_id'],
      type: 'primary key',
      name: 'pk_ticket_links',
    }); // :contentReference[oaicite:26]{index=26}

    await queryInterface.createTable('ticket_costs', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      labor_hours: { type: DECIMAL(6, 2), allowNull: true },
      labor_rate: { type: DECIMAL(10, 2), allowNull: true },
      parts_cost: { type: DECIMAL(10, 2), allowNull: true },
      currency: { type: CHAR(3), allowNull: false, defaultValue: 'EUR' },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    // Colonne générée "total" (stoquée)
    await queryInterface.sequelize.query(
      `ALTER TABLE ticket_costs
       ADD COLUMN total NUMERIC(12,2)
       GENERATED ALWAYS AS (COALESCE(labor_hours*labor_rate,0)+COALESCE(parts_cost,0)) STORED`,
    ); // :contentReference[oaicite:27]{index=27}

    await queryInterface.createTable('ticket_parts', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      sku: { type: TEXT, allowNull: true },
      label: { type: TEXT, allowNull: true },
      qty: { type: DECIMAL(10, 2), allowNull: true },
      unit_cost: { type: DECIMAL(10, 2), allowNull: true },
    }); // :contentReference[oaicite:28]{index=28}

    // ──────────────────────────────────────────────────────────────────────────
    // 7) Approvals & SLA                                                     SQL
    // ──────────────────────────────────────────────────────────────────────────
    await queryInterface.createTable('approval_requests', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      reason: { type: TEXT, allowNull: true },
      amount_estimate: { type: DECIMAL(12, 2), allowNull: true },
      currency: { type: CHAR(3), allowNull: false, defaultValue: 'EUR' },
      status: {
        type: ENUM('PENDING', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    }); // :contentReference[oaicite:29]{index=29}

    await queryInterface.createTable('sla_targets', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      kind: { type: ENUM('ack', 'resolve'), allowNull: false },
      deadline: { type: DATE, allowNull: false },
      paused: { type: BOOLEAN, allowNull: false, defaultValue: false },
      paused_at: { type: DATE, allowNull: true },
    }); // :contentReference[oaicite:30]{index=30}

    await queryInterface.createTable('sla_breaches', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      sla_target_id: { type: UUID, allowNull: false },
      breached_at: { type: DATE, allowNull: false },
      level: { type: INTEGER, allowNull: false },
      notified: { type: BOOLEAN, allowNull: false, defaultValue: false },
    }); // :contentReference[oaicite:31]{index=31}

    // ──────────────────────────────────────────────────────────────────────────
    // 8) Satisfaction & Well-being & Reports                                 SQL
    // ──────────────────────────────────────────────────────────────────────────
    await queryInterface.createTable('satisfaction_surveys', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      ticket_id: { type: UUID, allowNull: false },
      respondent_user_id: { type: UUID, allowNull: false },
      rating: { type: SMALLINT, allowNull: false },
      comment: { type: TEXT, allowNull: true },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addConstraint('satisfaction_surveys', {
      fields: ['ticket_id', 'respondent_user_id'],
      type: 'unique',
      name: 'uniq_satisfaction_ticket_respondent',
    }); // :contentReference[oaicite:32]{index=32}

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
    }); // :contentReference[oaicite:33]{index=33}
    await queryInterface.addIndex('well_being_scores', {
      fields: ['site_id', 'period_start'],
    });

    // RSE reports
    await queryInterface.createTable('rse_reports', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      company_id: { type: UUID, allowNull: false },
      period_start: { type: DATEONLY, allowNull: false },
      period_end: { type: DATEONLY, allowNull: false },
      satisfaction_avg: { type: DECIMAL(3, 2), allowNull: true },
      comfort_index_avg: { type: DECIMAL(5, 2), allowNull: true },
      ergonomics_tickets_count: { type: INTEGER, allowNull: true },
      resolved_ratio: { type: DECIMAL(5, 2), allowNull: true },
      export_path: { type: TEXT, allowNull: true },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addConstraint('rse_reports', {
      fields: ['company_id', 'period_start', 'period_end'],
      type: 'unique',
      name: 'uniq_rse_company_period',
    }); // :contentReference[oaicite:34]{index=34}

    // (Optionnel confort si activé dans le produit — conservé pour compat)
    await queryInterface.createTable('comfort_rules', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      site_id: { type: UUID, allowNull: false },
      type: { type: TEXT, allowNull: false }, // CHECK géré applicatif
      threshold_op: { type: TEXT, allowNull: false },
      threshold_low: { type: DECIMAL(10, 2), allowNull: true },
      threshold_high: { type: DECIMAL(10, 2), allowNull: true },
      window: { type: TEXT, allowNull: false, defaultValue: 'any' },
      category_id: { type: UUID, allowNull: false },
      active: { type: BOOLEAN, allowNull: false, defaultValue: true },
    });
    await queryInterface.addIndex('comfort_rules', {
      fields: ['site_id', 'type', 'active'],
    });

    await queryInterface.createTable('comfort_indicators', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      location_id: { type: UUID, allowNull: false },
      type: { type: TEXT, allowNull: false },
      value: { type: DECIMAL(10, 2), allowNull: false },
      unit: { type: TEXT, allowNull: false },
      measured_at: { type: DATE, allowNull: false },
      source: { type: TEXT, allowNull: false },
      sensor_id: { type: TEXT, allowNull: true },
      metadata: { type: JSON_TYPE, allowNull: true },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('comfort_indicators', {
      fields: ['location_id', 'measured_at'],
    });
    await queryInterface.addIndex('comfort_indicators', {
      fields: ['type', 'measured_at'],
    }); // :contentReference[oaicite:35]{index=35}

    // ──────────────────────────────────────────────────────────────────────────
    // 9) Foreign Keys (avec ON DELETE) — après création des tables
    // ──────────────────────────────────────────────────────────────────────────

    // Catalog references
    await queryInterface.addConstraint('sites', {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'fk_sites_company',
      references: { table: 'companies', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('buildings', {
      fields: ['site_id'],
      type: 'foreign key',
      name: 'fk_buildings_site',
      references: { table: 'sites', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('locations', {
      fields: ['building_id'],
      type: 'foreign key',
      name: 'fk_locations_building',
      references: { table: 'buildings', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('assets', {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'fk_assets_company',
      references: { table: 'companies', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('assets', {
      fields: ['location_id'],
      type: 'foreign key',
      name: 'fk_assets_location',
      references: { table: 'locations', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Taxonomy
    await queryInterface.addConstraint('categories', {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'fk_categories_company',
      references: { table: 'companies', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('skills', {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'fk_skills_company',
      references: { table: 'companies', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Directory
    await queryInterface.addConstraint('users', {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'fk_users_company',
      references: { table: 'companies', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('users', {
      fields: ['site_id'],
      type: 'foreign key',
      name: 'fk_users_site',
      references: { table: 'sites', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('teams', {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'fk_teams_company',
      references: { table: 'companies', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('team_members', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_team_members_team',
      references: { table: 'teams', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('team_members', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_team_members_user',
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('team_skills', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_team_skills_team',
      references: { table: 'teams', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('team_skills', {
      fields: ['skill_id'],
      type: 'foreign key',
      name: 'fk_team_skills_skill',
      references: { table: 'skills', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('team_zones', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_team_zones_team',
      references: { table: 'teams', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('team_zones', {
      fields: ['building_id'],
      type: 'foreign key',
      name: 'fk_team_zones_building',
      references: { table: 'buildings', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Admin scopes
    await queryInterface.addConstraint('admin_scopes', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_admin_scopes_user',
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('admin_scopes', {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'fk_admin_scopes_company',
      references: { table: 'companies', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('admin_scopes', {
      fields: ['site_id'],
      type: 'foreign key',
      name: 'fk_admin_scopes_site',
      references: { table: 'sites', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('admin_scopes', {
      fields: ['building_id'],
      type: 'foreign key',
      name: 'fk_admin_scopes_building',
      references: { table: 'buildings', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Contracts
    await queryInterface.addConstraint('contracts', {
      fields: ['site_id'],
      type: 'foreign key',
      name: 'fk_contracts_site',
      references: { table: 'sites', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('contracts', {
      fields: ['provider_company_id'],
      type: 'foreign key',
      name: 'fk_contracts_provider_company',
      references: { table: 'companies', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('contract_versions', {
      fields: ['contract_id'],
      type: 'foreign key',
      name: 'fk_contract_versions_contract',
      references: { table: 'contracts', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('contract_categories', {
      fields: ['contract_version_id'],
      type: 'foreign key',
      name: 'fk_contract_categories_version',
      references: { table: 'contract_versions', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('contract_categories', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_contract_categories_category',
      references: { table: 'categories', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('routing_rules', {
      fields: ['contract_version_id'],
      type: 'foreign key',
      name: 'fk_routing_rules_version',
      references: { table: 'contract_versions', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('competency_matrix', {
      fields: ['contract_version_id'],
      type: 'foreign key',
      name: 'fk_competency_matrix_version',
      references: { table: 'contract_versions', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('competency_matrix', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_competency_matrix_team',
      references: { table: 'teams', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('competency_matrix', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_competency_matrix_category',
      references: { table: 'categories', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('competency_matrix', {
      fields: ['building_id'],
      type: 'foreign key',
      name: 'fk_competency_matrix_building',
      references: { table: 'buildings', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Calendar
    await queryInterface.addConstraint('holidays', {
      fields: ['calendar_id'],
      type: 'foreign key',
      name: 'fk_holidays_calendar',
      references: { table: 'holiday_calendars', field: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Tickets
    const fk = (tbl, field, refTbl, name, del = 'RESTRICT') =>
      queryInterface.addConstraint(tbl, {
        fields: [field],
        type: 'foreign key',
        name,
        references: { table: refTbl, field: 'id' },
        onDelete: del,
        onUpdate: 'CASCADE',
      });

    await fk(
      'tickets',
      'company_id',
      'companies',
      'fk_ticket_company',
      'CASCADE',
    );
    await fk('tickets', 'site_id', 'sites', 'fk_ticket_site', 'CASCADE');
    await fk(
      'tickets',
      'building_id',
      'buildings',
      'fk_ticket_building',
      'SET NULL',
    );
    await fk(
      'tickets',
      'location_id',
      'locations',
      'fk_ticket_location',
      'SET NULL',
    );
    await fk(
      'tickets',
      'category_id',
      'categories',
      'fk_ticket_category',
      'RESTRICT',
    );
    await fk('tickets', 'asset_id', 'assets', 'fk_ticket_asset', 'SET NULL');
    await fk(
      'tickets',
      'reporter_id',
      'users',
      'fk_ticket_reporter',
      'RESTRICT',
    );
    await fk(
      'tickets',
      'assignee_team_id',
      'teams',
      'fk_ticket_assignee_team',
      'SET NULL',
    );
    await fk(
      'tickets',
      'contract_id',
      'contracts',
      'fk_ticket_contract',
      'SET NULL',
    );

    await fk(
      'ticket_events',
      'ticket_id',
      'tickets',
      'fk_ticket_events_ticket',
      'CASCADE',
    );
    await fk(
      'ticket_events',
      'actor_user_id',
      'users',
      'fk_ticket_events_actor',
      'SET NULL',
    );

    await fk(
      'ticket_comments',
      'ticket_id',
      'tickets',
      'fk_ticket_comments_ticket',
      'CASCADE',
    );
    await fk(
      'ticket_comments',
      'author_user_id',
      'users',
      'fk_ticket_comments_author',
      'RESTRICT',
    );

    await fk(
      'ticket_attachments',
      'ticket_id',
      'tickets',
      'fk_ticket_attachments_ticket',
      'CASCADE',
    );
    await fk(
      'ticket_attachments',
      'uploaded_by',
      'users',
      'fk_ticket_attachments_uploader',
      'SET NULL',
    );

    await fk(
      'ticket_links',
      'parent_ticket_id',
      'tickets',
      'fk_ticket_links_parent',
      'CASCADE',
    );
    await fk(
      'ticket_links',
      'child_ticket_id',
      'tickets',
      'fk_ticket_links_child',
      'CASCADE',
    );

    await fk(
      'ticket_costs',
      'ticket_id',
      'tickets',
      'fk_ticket_costs_ticket',
      'CASCADE',
    );
    await fk(
      'ticket_parts',
      'ticket_id',
      'tickets',
      'fk_ticket_parts_ticket',
      'CASCADE',
    );

    await fk(
      'approval_requests',
      'ticket_id',
      'tickets',
      'fk_approval_requests_ticket',
      'CASCADE',
    );

    await fk(
      'sla_targets',
      'ticket_id',
      'tickets',
      'fk_sla_targets_ticket',
      'CASCADE',
    );
    await queryInterface.addConstraint('sla_breaches', {
      fields: ['sla_target_id'],
      type: 'foreign key',
      name: 'fk_sla_breaches_target',
      references: { table: 'sla_targets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await fk(
      'satisfaction_surveys',
      'ticket_id',
      'tickets',
      'fk_satisfaction_ticket',
      'CASCADE',
    );
    await fk(
      'satisfaction_surveys',
      'respondent_user_id',
      'users',
      'fk_satisfaction_user',
      'RESTRICT',
    );

    await fk(
      'well_being_scores',
      'site_id',
      'sites',
      'fk_wellbeing_site',
      'CASCADE',
    );

    await fk(
      'rse_reports',
      'company_id',
      'companies',
      'fk_rse_company',
      'CASCADE',
    );

    await fk(
      'comfort_rules',
      'site_id',
      'sites',
      'fk_comfort_rules_site',
      'CASCADE',
    );
    await fk(
      'comfort_rules',
      'category_id',
      'categories',
      'fk_comfort_rules_category',
      'RESTRICT',
    );
    await fk(
      'comfort_indicators',
      'location_id',
      'locations',
      'fk_comfort_indicators_location',
      'CASCADE',
    );
  },

  async down(queryInterface) {
    // Drop in strict reverse dependency order
    await queryInterface.dropTable('comfort_indicators');
    await queryInterface.dropTable('comfort_rules');
    await queryInterface.dropTable('rse_reports');
    await queryInterface.dropTable('well_being_scores');
    await queryInterface.dropTable('satisfaction_surveys');
    await queryInterface.dropTable('sla_breaches');
    await queryInterface.dropTable('sla_targets');
    await queryInterface.dropTable('approval_requests');
    await queryInterface.dropTable('ticket_parts');
    await queryInterface.dropTable('ticket_costs');
    await queryInterface.dropTable('ticket_links');
    await queryInterface.dropTable('ticket_attachments');
    await queryInterface.dropTable('ticket_comments');
    await queryInterface.dropTable('ticket_events');
    await queryInterface.dropTable('tickets');

    await queryInterface.dropTable('holidays');
    await queryInterface.dropTable('holiday_calendars');

    await queryInterface.dropTable('competency_matrix');
    await queryInterface.dropTable('routing_rules');
    await queryInterface.dropTable('contract_categories');
    await queryInterface.dropTable('contract_versions');
    await queryInterface.dropTable('contracts');

    await queryInterface.dropTable('admin_scopes');
    await queryInterface.dropTable('team_zones');
    await queryInterface.dropTable('team_skills');
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
