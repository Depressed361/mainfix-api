'use strict';

async function getTableDefinition(queryInterface, tableName) {
  try {
    return await queryInterface.describeTable(tableName);
  } catch (error) {
    console.warn(`[migration] Could not describe table ${tableName}`, error);
    throw error;
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const ticketsTable = await getTableDefinition(queryInterface, 'tickets');

    if (!ticketsTable.number) {
      await queryInterface.addColumn('tickets', 'number', {
        type: Sequelize.STRING(32),
        allowNull: true,
      });

      await queryInterface.sequelize.query(`
        UPDATE tickets
        SET number = CONCAT('T-', substring(id::text, 1, 12))
        WHERE number IS NULL;
      `);

      await queryInterface.changeColumn('tickets', 'number', {
        type: Sequelize.STRING(32),
        allowNull: false,
      });

      await queryInterface.addConstraint('tickets', {
        fields: ['number'],
        type: 'unique',
        name: 'tickets_number_unique',
      });
    }

    if (!ticketsTable.assigned_at) {
      await queryInterface.addColumn('tickets', 'assigned_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (!ticketsTable.status_updated_at) {
      await queryInterface.addColumn('tickets', 'status_updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      });
    }

    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== 'postgres') {
      console.warn('[migration] Skipping ticket status enum upgrade for dialect', dialect);
      return;
    }

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        CREATE TYPE ticket_status_new AS ENUM (
          'draft',
          'open',
          'assigned',
          'in_progress',
          'awaiting_confirmation',
          'resolved',
          'closed',
          'cancelled'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status_new ticket_status_new;
    `);

    await queryInterface.sequelize.query(`
      UPDATE tickets
      SET status_new = CASE
        WHEN status IN ('NEW', 'TRI_AUTO') THEN 'open'
        WHEN status::text LIKE 'ASSIGN%' THEN 'assigned'
        WHEN status::text LIKE 'EN_COURS%' THEN 'in_progress'
        WHEN status::text LIKE 'EN_ATTENTE%' THEN 'awaiting_confirmation'
        WHEN status::text LIKE 'R%SOLU%' THEN 'resolved'
        WHEN status::text LIKE 'VALID%' THEN 'closed'
        WHEN status = 'CLOS' THEN 'closed'
        WHEN status = 'BACKLOG' THEN 'draft'
        ELSE COALESCE(status_new, 'open')
      END;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE tickets ALTER COLUMN status_new SET DEFAULT 'open';
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE tickets DROP COLUMN status;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE tickets RENAME COLUMN status_new TO status;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'open';
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE tickets ALTER COLUMN status SET NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_tickets_status;
    `);
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          CREATE TYPE ticket_status_old AS ENUM (
            'NEW',
            'TRI_AUTO',
            'ASSIGNÉ',
            'EN_COURS',
            'EN_ATTENTE',
            'RÉSOLU',
            'VALIDÉ',
            'CLOS',
            'BACKLOG'
          );
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END
        $$;
      `);

      await queryInterface.sequelize.query(`
        ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status_old ticket_status_old;
      `);

      await queryInterface.sequelize.query(`
        UPDATE tickets
        SET status_old = CASE
          WHEN status = 'draft' THEN 'BACKLOG'
          WHEN status = 'open' THEN 'NEW'
          WHEN status = 'assigned' THEN 'ASSIGNÉ'
          WHEN status = 'in_progress' THEN 'EN_COURS'
          WHEN status = 'awaiting_confirmation' THEN 'EN_ATTENTE'
          WHEN status = 'resolved' THEN 'RÉSOLU'
          WHEN status = 'closed' THEN 'CLOS'
          WHEN status = 'cancelled' THEN 'BACKLOG'
          ELSE COALESCE(status_old, 'NEW')
        END;
      `);

      await queryInterface.sequelize.query(`
        ALTER TABLE tickets DROP COLUMN status;
      `);

      await queryInterface.sequelize.query(`
        ALTER TABLE tickets RENAME COLUMN status_old TO status;
      `);

      await queryInterface.sequelize.query(`
        ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'NEW';
      `);

      await queryInterface.sequelize.query(`
        ALTER TABLE tickets ALTER COLUMN status SET NOT NULL;
      `);

      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS ticket_status_new;
      `);
    }

    try {
      await queryInterface.removeConstraint('tickets', 'tickets_number_unique');
    } catch (error) {
      console.warn('[migration down] Skipping number unique constraint removal', error?.message);
    }

    const ticketsTable = await getTableDefinition(queryInterface, 'tickets');

    if (ticketsTable.number) {
      await queryInterface.removeColumn('tickets', 'number');
    }
    if (ticketsTable.assigned_at) {
      await queryInterface.removeColumn('tickets', 'assigned_at');
    }
    if (ticketsTable.status_updated_at) {
      await queryInterface.removeColumn('tickets', 'status_updated_at');
    }
  },
};
