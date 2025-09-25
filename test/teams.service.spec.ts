import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { SqliteTestingModule } from './utils/slqlite-testing.module';
import { TeamsService } from '../src/modules/directory/services/teams.service';
import { Team } from '../src/modules/directory/models/team.model';
import { TeamMember } from '../src/modules/directory/models/team-member.model';

const COMPANY_A = '11111111-1111-1111-1111-111111111111';
const COMPANY_B = '22222222-2222-2222-2222-222222222222';

describe('TeamsService', () => {
  let moduleRef: TestingModule;
  let service: TeamsService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        SqliteTestingModule([Team, TeamMember]),
        SequelizeModule.forFeature([Team, TeamMember]),
      ],
      providers: [TeamsService],
    }).compile();

    service = moduleRef.get(TeamsService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('creates and retrieves a team', async () => {
    const created = await service.create({
      companyId: COMPANY_A,
      name: 'Maintenance A',
      type: 'internal',
    });
    const all = await service.findAll();
    expect(all.find((t) => t.get('id') === created.get('id'))).toBeTruthy();
  });

  it('filters teams by company', async () => {
    await service.create({
      companyId: COMPANY_B,
      name: 'HQ Team',
      type: 'internal',
    });
    await service.create({
      companyId: '33333333-3333-3333-3333-333333333333',
      name: 'Vendor B',
      type: 'vendor',
    });

    const filtered = await service.findAll(COMPANY_B);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.get('name')).toBe('HQ Team');
  });

  it('removes a team', async () => {
    const team = await service.create({
      companyId: '44444444-4444-4444-4444-444444444444',
      name: 'Temp Team',
      type: 'internal',
    });

    const response = await service.remove(team.get('id') as string);
    expect(response).toEqual({ deleted: true });

    await expect(service.remove(team.get('id') as string)).rejects.toThrow(
      'Team not found',
    );
  });

  it('adds and removes a team member with company checks', async () => {
    const team = await service.create({
      companyId: COMPANY_A,
      name: 'Ops Team',
      type: 'internal',
    });
    const teamId = team.get('id') as string;
    const userId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

    const addResult = await service.addMember(teamId, userId, COMPANY_A);
    expect(addResult.created).toBe(true);

    const secondAdd = await service.addMember(teamId, userId, COMPANY_A);
    expect(secondAdd.created).toBe(false);

    const removeResult = await service.removeMember(teamId, userId, COMPANY_A);
    expect(removeResult).toEqual({ deleted: true });

    await expect(
      service.removeMember(teamId, userId, COMPANY_A),
    ).rejects.toThrow('Team member not found');
  });

  it('rejects member operations when company does not match', async () => {
    const team = await service.create({
      companyId: COMPANY_A,
      name: 'Mismatch Team',
      type: 'internal',
    });
    const teamId = team.get('id') as string;
    const userId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    await expect(
      service.addMember(teamId, userId, COMPANY_B),
    ).rejects.toThrow('Team does not belong to specified company');

    await expect(
      service.removeMember(teamId, userId, COMPANY_B),
    ).rejects.toThrow('Team does not belong to specified company');
  });
});
