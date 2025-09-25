import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTeamDto {
  @IsUUID()
  @IsNotEmpty()
  companyId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(['internal', 'vendor'] as const)
  type!: 'internal' | 'vendor';

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
