export interface Skill {
  id: string;
  companyId: string;
  key: string;
  label: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SkillProps {
  companyId: string;
  key: string;
  label: string;
}
