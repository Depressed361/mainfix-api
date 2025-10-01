import type { AuthenticatedActor } from '../../../auth/auth-actor.types';
import type { TeamSkillRepository, ContractQuery, TeamQuery, UUID } from '../ports';
import { assertSameCompany } from '../policies';

export class GrantTeamSkill {
  constructor(
    private readonly skills: TeamSkillRepository,
    private readonly contracts: ContractQuery,
    private readonly teams: TeamQuery,
  ) {}

  async execute(actor: AuthenticatedActor, teamId: UUID, skillId: UUID, contractVersionId: UUID) {
    await assertSameCompany(actor, { contracts: this.contracts, teams: this.teams }, { contractVersionId, teamId });
    await this.skills.upsert({ teamId, skillId });
  }
}

