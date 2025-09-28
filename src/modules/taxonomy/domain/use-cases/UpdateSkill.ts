import { Inject, Injectable } from '@nestjs/common';
import { Skill } from '../entities/Skill';
import { ConflictError, ForbiddenError, NotFoundError } from '../errors';
import { SkillRepository, SKILL_REPOSITORY } from '../ports';

export interface UpdateSkillInput {
  id: string;
  companyId: string;
  patch: Partial<Pick<Skill, 'key' | 'label'>>;
}

@Injectable()
export class UpdateSkill {
  constructor(
    @Inject(SKILL_REPOSITORY)
    private readonly skills: SkillRepository,
  ) {}

  async execute({ id, companyId, patch }: UpdateSkillInput): Promise<Skill> {
    const skill = await this.skills.findById(id);
    if (!skill) {
      throw new NotFoundError('taxonomy.skill.not_found');
    }
    if (skill.companyId !== companyId) {
      throw new ForbiddenError('taxonomy.skill.company_mismatch');
    }

    if (patch.key && patch.key !== skill.key) {
      const existing = await this.skills.findByKey(companyId, patch.key);
      if (existing) {
        throw new ConflictError('taxonomy.skill.key_conflict');
      }
    }

    return this.skills.update(id, patch);
  }
}
