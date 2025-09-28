import { Inject, Injectable } from '@nestjs/common';
import { ForbiddenError, NotFoundError, ConflictError } from '../errors';
import type { SkillRepository } from '../ports';
import { SKILL_REPOSITORY } from '../ports';
import { canDeleteSkill } from '../policies';

export interface DeleteSkillInput {
  id: string;
  companyId: string;
}

@Injectable()
export class DeleteSkill {
  constructor(
    @Inject(SKILL_REPOSITORY)
    private readonly skills: SkillRepository,
  ) {}

  async execute({ id, companyId }: DeleteSkillInput): Promise<void> {
    const skill = await this.skills.findById(id);
    if (!skill) {
      throw new NotFoundError('taxonomy.skill.not_found');
    }
    if (skill.companyId !== companyId) {
      throw new ForbiddenError('taxonomy.skill.company_mismatch');
    }

    const canDelete = canDeleteSkill({
      hasCategoryLinks: (await this.skills.countCategoryLinks(id)) > 0,
      hasTeamSkills: (await this.skills.countTeamSkills(id)) > 0,
    });

    if (!canDelete) {
      throw new ConflictError('taxonomy.skill.delete_conflict');
    }

    await this.skills.deleteById(id);
  }
}
