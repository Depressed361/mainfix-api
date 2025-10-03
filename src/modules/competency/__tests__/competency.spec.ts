import { UpsertCompetency } from '../domain/use-cases/UpsertCompetency';
import { InvalidInputError } from '../domain/errors';

describe('Competency domain - unit', () => {
  it('UpsertCompetency rejects when primary team lacks required skills', async () => {
    const matrix = {
      upsert: jest.fn(async (x) => ({ id: 'id', ...x })),
    } as any;
    const taxonomy = {
      requiredSkillsForCategory: jest.fn(async () => ['s1', 's2']),
    } as any;
    const teamSkills = {
      listByTeam: jest.fn(async () => [{ teamId: 't', skillId: 's1' }]),
    } as any;
    const cq = {
      getContractVersionMeta: async () => ({
        contractId: 'c',
        siteId: 's',
        companyId: 'co',
        version: 1,
        coverage: {},
        escalation: null,
        approvals: null,
        categories: [],
      }),
    } as any;
    const cat = {
      getBuildingMeta: async () => ({ siteId: 's', companyId: 'co' }),
    } as any;
    const tq = {
      getTeamMeta: async () => ({ companyId: 'co', active: true }),
    } as any;
    const uc = new UpsertCompetency(matrix, taxonomy, teamSkills, cq, cat, tq);
    const actor: any = {
      companyId: 'co',
      scopeStrings: ['admin:company'],
      companyScopeIds: ['co'],
    };
    await expect(
      uc.execute(actor, {
        contractVersionId: 'cv',
        teamId: 't',
        categoryId: 'cat',
        buildingId: null,
        level: 'primary',
        window: 'any',
      }),
    ).rejects.toBeInstanceOf(InvalidInputError);
  });
});
