import { IsNotEmpty, IsUUID } from 'class-validator';

export class ManageTeamMemberDto {
  @IsUUID()
  @IsNotEmpty()
  companyId!: string;

  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}

export class TeamMemberScopeDto {
  @IsUUID()
  @IsNotEmpty()
  companyId!: string;
}
