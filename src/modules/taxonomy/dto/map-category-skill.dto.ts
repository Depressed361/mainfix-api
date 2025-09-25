import { IsUUID } from 'class-validator';

export class MapCategorySkillDto {
  @IsUUID()
  categoryId!: string;

  @IsUUID()
  skillId!: string;
}
