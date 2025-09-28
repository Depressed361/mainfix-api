export interface CategoryDeletionContext {
  hasTickets: boolean;
  hasContracts: boolean;
  hasSkills: boolean;
}

export interface SkillDeletionContext {
  hasTeamSkills: boolean;
  hasCategoryLinks: boolean;
}

export function canDeleteCategory(context: CategoryDeletionContext): boolean {
  return !context.hasTickets && !context.hasContracts && !context.hasSkills;
}

export function canDeleteSkill(context: SkillDeletionContext): boolean {
  return !context.hasTeamSkills && !context.hasCategoryLinks;
}
