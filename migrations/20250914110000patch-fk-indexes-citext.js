'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { UUID } = Sequelize;

    // 1) CITEXT email
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS citext;',
    );
    // si ta colonne users.email existe déjà en TEXT :
    await queryInterface.sequelize.query(
      'ALTER TABLE IF EXISTS users ALTER COLUMN email TYPE CITEXT USING email::citext;',
    );

    // 2) FK principales (exemples — à compléter selon ton besoin)
    await queryInterface.addConstraint('users', {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'fk_users_company',
      references: { table: 'companies', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

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

    await queryInterface.addConstraint('contracts', {
      fields: ['site_id'],
      type: 'foreign key',
      name: 'fk_contracts_site',
      references: { table: 'sites', field: 'id' },
      onDelete: 'CASCADE',
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

    await queryInterface.addConstraint('category_skills', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_category_skills_category',
      references: { table: 'categories', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('category_skills', {
      fields: ['skill_id'],
      type: 'foreign key',
      name: 'fk_category_skills_skill',
      references: { table: 'skills', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('competency_matrix', {
      fields: ['contract_version_id'],
      type: 'foreign key',
      name: 'fk_competency_version',
      references: { table: 'contract_versions', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('competency_matrix', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_competency_team',
      references: { table: 'teams', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('competency_matrix', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_competency_category',
      references: { table: 'categories', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('competency_matrix', {
      fields: ['building_id'],
      type: 'foreign key',
      name: 'fk_competency_building',
      references: { table: 'buildings', field: 'id' },
      onDelete: 'SET NULL',
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

    // Tickets (beaucoup de FK)
    const ticketFk = [
      ['company_id', 'companies', 'id', 'fk_tickets_company'],
      ['site_id', 'sites', 'id', 'fk_tickets_site'],
      ['building_id', 'buildings', 'id', 'fk_tickets_building'],
      ['location_id', 'locations', 'id', 'fk_tickets_location'],
      ['category_id', 'categories', 'id', 'fk_tickets_category'],
      ['asset_id', 'assets', 'id', 'fk_tickets_asset'],
      ['reporter_id', 'users', 'id', 'fk_tickets_reporter'],
      ['assignee_team_id', 'teams', 'id', 'fk_tickets_assignee_team'],
      ['contract_id', 'contracts', 'id', 'fk_tickets_contract'],
    ];
    for (const [col, table, field, name] of ticketFk) {
      await queryInterface.addConstraint('tickets', {
        fields: [col],
        type: 'foreign key',
        name,
        references: { table, field },
        onDelete:
          col.endsWith('_id') &&
          ['building_id', 'location_id', 'asset_id'].includes(col)
            ? 'SET NULL'
            : 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }

    await queryInterface.addConstraint('ticket_events', {
      fields: ['ticket_id'],
      type: 'foreign key',
      name: 'fk_ticket_events_ticket',
      references: { table: 'tickets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('ticket_comments', {
      fields: ['ticket_id'],
      type: 'foreign key',
      name: 'fk_ticket_comments_ticket',
      references: { table: 'tickets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('ticket_comments', {
      fields: ['author_user_id'],
      type: 'foreign key',
      name: 'fk_ticket_comments_author',
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('ticket_attachments', {
      fields: ['ticket_id'],
      type: 'foreign key',
      name: 'fk_ticket_attachments_ticket',
      references: { table: 'tickets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('ticket_links', {
      fields: ['parent_ticket_id'],
      type: 'foreign key',
      name: 'fk_ticket_links_parent',
      references: { table: 'tickets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('ticket_links', {
      fields: ['child_ticket_id'],
      type: 'foreign key',
      name: 'fk_ticket_links_child',
      references: { table: 'tickets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('ticket_costs', {
      fields: ['ticket_id'],
      type: 'foreign key',
      name: 'fk_ticket_costs_ticket',
      references: { table: 'tickets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('ticket_parts', {
      fields: ['ticket_id'],
      type: 'foreign key',
      name: 'fk_ticket_parts_ticket',
      references: { table: 'tickets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('sla_targets', {
      fields: ['ticket_id'],
      type: 'foreign key',
      name: 'fk_sla_targets_ticket',
      references: { table: 'tickets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('sla_breaches', {
      fields: ['sla_target_id'],
      type: 'foreign key',
      name: 'fk_sla_breaches_target',
      references: { table: 'sla_targets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('approval_requests', {
      fields: ['ticket_id'],
      type: 'foreign key',
      name: 'fk_approval_requests_ticket',
      references: { table: 'tickets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('satisfaction_surveys', {
      fields: ['ticket_id'],
      type: 'foreign key',
      name: 'fk_satisfaction_ticket',
      references: { table: 'tickets', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('satisfaction_surveys', {
      fields: ['respondent_user_id'],
      type: 'foreign key',
      name: 'fk_satisfaction_user',
      references: { table: 'users', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // 3) Indexes utiles (extraits du design)
    await queryInterface.addIndex(
      'tickets',
      ['company_id', 'site_id', 'status'],
      { name: 'idx_tickets_company_site_status' },
    );
    await queryInterface.addIndex(
      'tickets',
      ['assignee_team_id', 'status', 'priority'],
      { name: 'idx_tickets_assignee_status_priority' },
    );
    await queryInterface.addIndex('tickets', ['sla_ack_deadline'], {
      name: 'idx_tickets_sla_ack',
    });
    await queryInterface.addIndex('tickets', ['sla_resolve_deadline'], {
      name: 'idx_tickets_sla_resolve',
    });
  },

  async down(queryInterface) {
    // Drop indexes (sélection)
    await queryInterface
      .removeIndex('tickets', 'idx_tickets_company_site_status')
      .catch(() => {});
    await queryInterface
      .removeIndex('tickets', 'idx_tickets_assignee_status_priority')
      .catch(() => {});
    await queryInterface
      .removeIndex('tickets', 'idx_tickets_sla_ack')
      .catch(() => {});
    await queryInterface
      .removeIndex('tickets', 'idx_tickets_sla_resolve')
      .catch(() => {});

    // Drop FK (exemples)
    await queryInterface
      .removeConstraint('users', 'fk_users_company')
      .catch(() => {});
    // … idem pour chaque contrainte ajoutée ci-dessus (tu peux laisser le down minimal en dev)
  },
};
