/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const companies = [
      { id: '11111111-1111-1111-1111-111111111111', name: 'Company One', created_at: now },
      { id: '22222222-2222-2222-2222-222222222222', name: 'Company Two', created_at: now },
    ];
    await queryInterface.bulkInsert('companies', companies);

    const sites = [
      { id: '33333333-3333-3333-3333-333333333333', company_id: companies[0].id, code: 'S1', name: 'HQ', timezone: 'Europe/Paris' },
      { id: '44444444-4444-4444-4444-444444444444', company_id: companies[1].id, code: 'S2', name: 'Remote', timezone: 'Europe/Paris' },
    ];
    await queryInterface.bulkInsert('sites', sites);

    const categories = [
      { id: '55555555-5555-5555-5555-555555555555', company_id: companies[0].id, key: 'HVAC', label: 'HVAC' },
    ];
    await queryInterface.bulkInsert('categories', categories);

    const users = [
      { id: '66666666-6666-6666-6666-666666666666', company_id: companies[0].id, passwordHash: 'x', email: 'manager1@test.local', site_id: null, display_name: 'Manager One', role: 'manager', active: true, created_at: now },
      { id: '77777777-7777-7777-7777-777777777777', company_id: companies[0].id, passwordHash: 'x', email: 'maint1@test.local', site_id: null, display_name: 'Maintainer One', role: 'maintainer', active: true, created_at: now },
      { id: '88888888-8888-8888-8888-888888888888', company_id: companies[0].id, passwordHash: 'x', email: 'vendor1@test.local', site_id: null, display_name: 'Vendor User', role: 'maintainer', active: true, created_at: now },
      { id: '12121212-1212-1212-1212-121212121212', company_id: companies[0].id, passwordHash: 'x', email: 'occupant1@test.local', site_id: null, display_name: 'Occupant One', role: 'occupant', active: true, created_at: now },
      { id: 'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb', company_id: companies[0].id, passwordHash: 'x', email: 'admin1@test.local', site_id: null, display_name: 'Company Admin', role: 'admin', active: true, created_at: now },
    ];
    await queryInterface.bulkInsert('users', users);

    const teams = [
      { id: '99999999-9999-9999-9999-999999999999', company_id: companies[0].id, name: 'Internal Team', type: 'internal', active: true },
      { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', company_id: companies[0].id, name: 'Vendor Team', type: 'vendor', active: true },
    ];
    await queryInterface.bulkInsert('teams', teams);

    const teamMembers = [
      { team_id: teams[0].id, user_id: users[1].id },
      { team_id: teams[1].id, user_id: users[2].id },
    ];
    await queryInterface.bulkInsert('team_members', teamMembers);

    // Admin scopes for the admin user (company scope on company One)
    await queryInterface.bulkInsert('admin_scopes', [
      { user_id: 'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb', scope: 'company', company_id: companies[0].id, site_id: null, building_id: null, created_at: now },
    ]);

    const contracts = [
      { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', site_id: sites[0].id, name: 'Facilities Mgt', active: true },
    ];
    await queryInterface.bulkInsert('contracts', contracts);

    const coverage = { working: { timezone: 'Europe/Paris', businessHours: { start: '08:00', end: '18:00' }, weekdays: [1,2,3,4,5], holidayCalendarCode: 'FR' } };
    const approvals = { thresholdEUR: '100.00', keepBlockedOnReject: true };
    const contractVersions = [
      { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', contract_id: contracts[0].id, version: 1, created_at: now, coverage: JSON.stringify(coverage), escalation: null, approvals: JSON.stringify(approvals) },
    ];
    await queryInterface.bulkInsert('contract_versions', contractVersions);

    // Holiday calendar + holidays
    await queryInterface.bulkInsert('holiday_calendars', [ { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', code: 'FR', country: 'France' } ]);
    await queryInterface.bulkInsert('holidays', [
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', calendar_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', day: '2025-01-01', label: 'New Year' },
      { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', calendar_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', day: '2025-05-01', label: 'Labour Day' },
    ]);

    // Tickets
    const tickets = [
      { id: 'aaaaaaaa-0000-0000-0000-000000000001', number: 'T-0001', company_id: companies[0].id, site_id: sites[0].id, building_id: null, location_id: null, category_id: categories[0].id, asset_id: null, reporter_id: users[0].id, assignee_team_id: teams[0].id, ergonomie: null, priority: 'P2', status: 'open', title: 'HVAC Noise', description: 'Noisy fan', photos: null, sla_ack_deadline: null, sla_resolve_deadline: null, ack_at: null, resolved_at: null, contract_id: contracts[0].id, contract_version: 1, contract_snapshot: null, created_at: now, updated_at: now },
      { id: 'aaaaaaaa-0000-0000-0000-000000000002', number: 'T-0002', company_id: companies[0].id, site_id: sites[0].id, building_id: null, location_id: null, category_id: categories[0].id, asset_id: null, reporter_id: users[0].id, assignee_team_id: teams[1].id, ergonomie: null, priority: 'P3', status: 'open', title: 'Vendor Visit', description: 'Travel fee expected', photos: null, sla_ack_deadline: null, sla_resolve_deadline: null, ack_at: null, resolved_at: null, contract_id: contracts[0].id, contract_version: 1, contract_snapshot: null, created_at: now, updated_at: now },
      { id: 'aaaaaaaa-0000-0000-0000-000000000003', number: 'T-0003', company_id: companies[0].id, site_id: sites[0].id, building_id: null, location_id: null, category_id: categories[0].id, asset_id: null, reporter_id: users[0].id, assignee_team_id: teams[0].id, ergonomie: null, priority: 'P1', status: 'open', title: 'Approval Past', description: 'Already approved', photos: null, sla_ack_deadline: null, sla_resolve_deadline: null, ack_at: null, resolved_at: null, contract_id: contracts[0].id, contract_version: 1, contract_snapshot: null, created_at: now, updated_at: now },
    ];
    await queryInterface.bulkInsert('tickets', tickets);

    // Costs baseline
    await queryInterface.bulkInsert('ticket_costs', [
      { id: '11111111-2222-3333-4444-555555555551', ticket_id: tickets[0].id, labor_hours: '2.50', labor_rate: '60.00', parts_cost: '20.00', currency: 'EUR', created_at: now },
      { id: '11111111-2222-3333-4444-555555555552', ticket_id: tickets[1].id, labor_hours: '1.00', labor_rate: '80.00', parts_cost: '0.00', currency: 'EUR', created_at: now },
    ]);
    await queryInterface.bulkInsert('ticket_parts', [
      { id: '11111111-aaaa-bbbb-cccc-222222222221', ticket_id: tickets[0].id, sku: 'FILTER', label: 'Air Filter', qty: '1.00', unit_cost: '20.00' },
      { id: '11111111-aaaa-bbbb-cccc-222222222222', ticket_id: tickets[1].id, sku: 'TRAVEL', label: 'Travel fee', qty: '1.00', unit_cost: '50.00' },
    ]);

    // Approvals sample
    await queryInterface.bulkInsert('approval_requests', [
      { id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1', ticket_id: tickets[1].id, reason: 'TRAVEL_FEE', amount_estimate: '50.00', currency: 'EUR', status: 'PENDING', created_at: now },
      { id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee2', ticket_id: tickets[2].id, reason: 'COST_THRESHOLD', amount_estimate: '150.00', currency: 'EUR', status: 'APPROVED', created_at: now },
      { id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee3', ticket_id: tickets[0].id, reason: 'OTHER', amount_estimate: '10.00', currency: 'EUR', status: 'REJECTED', created_at: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const ids = [
      '11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333','44444444-4444-4444-4444-444444444444',
      '55555555-5555-5555-5555-555555555555',
      '66666666-6666-6666-6666-666666666666','77777777-7777-7777-7777-777777777777','88888888-8888-8888-8888-888888888888',
      '99999999-9999-9999-9999-999999999999','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','cccccccc-cccc-cccc-cccc-cccccccccccc',
      'dddddddd-dddd-dddd-dddd-dddddddddddd','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
      'ffffffff-ffff-ffff-ffff-fffffffffff1','ffffffff-ffff-ffff-ffff-fffffffffff2','ffffffff-ffff-ffff-ffff-fffffffffff3',
      '11111111-2222-3333-4444-555555555551','11111111-2222-3333-4444-555555555552',
      '11111111-aaaa-bbbb-cccc-222222222221','11111111-aaaa-bbbb-cccc-222222222222',
      'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee1','aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee2','aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeee3',
    ];
    await queryInterface.bulkDelete('approval_requests', { id: ids });
    await queryInterface.bulkDelete('ticket_parts', { id: ids });
    await queryInterface.bulkDelete('ticket_costs', { id: ids });
    await queryInterface.bulkDelete('tickets', { id: ids });
    await queryInterface.bulkDelete('holidays', { id: ids });
    await queryInterface.bulkDelete('holiday_calendars', { id: ids });
    await queryInterface.bulkDelete('contract_versions', { id: ids });
    await queryInterface.bulkDelete('contracts', { id: ids });
    await queryInterface.bulkDelete('team_members', { team_id: ['99999999-9999-9999-9999-999999999999','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'] });
    await queryInterface.bulkDelete('teams', { id: ['99999999-9999-9999-9999-999999999999','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'] });
    await queryInterface.bulkDelete('users', { id: ids });
    await queryInterface.bulkDelete('categories', { id: ids });
    await queryInterface.bulkDelete('sites', { id: ids });
    await queryInterface.bulkDelete('companies', { id: ids });
  }
};
