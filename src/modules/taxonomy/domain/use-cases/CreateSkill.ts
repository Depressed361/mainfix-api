import { Inject, Injectable } from '@nestjs/common';
import { Skill } from '../entities/Skill';
import { ConflictError } from '../errors';
import type { SkillRepository } from '../ports';
import { SKILL_REPOSITORY } from '../ports';

export interface CreateSkillInput {
  companyId: string;
  key: string;
  label: string;
}

@Injectable()
export class CreateSkill {
  constructor(
    @Inject(SKILL_REPOSITORY)
    private readonly skills: SkillRepository,
  ) {}

  async execute(input: CreateSkillInput): Promise<Skill> {
    const existing = await this.skills.findByKey(input.companyId, input.key);
    if (existing) {
      throw new ConflictError('taxonomy.skill.key_conflict');
    }

    return this.skills.create({
      companyId: input.companyId,
      key: input.key,
      label: input.label,
    });
  }
}
