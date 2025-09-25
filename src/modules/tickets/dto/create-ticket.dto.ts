import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTicketDto {
  @IsUUID()
  @IsNotEmpty()
  companyId!: string;

  @IsUUID()
  @IsNotEmpty()
  siteId!: string;

  @IsOptional()
  @IsUUID()
  buildingId?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsOptional()
  @IsUUID()
  assetId?: string;

  @IsUUID()
  @IsNotEmpty()
  reporterId!: string;

  @IsOptional()
  @IsUUID()
  assigneeTeamId?: string;

  @IsOptional()
  @IsBoolean()
  draft?: boolean;

  @IsOptional()
  @IsBoolean()
  autoAssign?: boolean;

  @IsEnum(['P1', 'P2', 'P3'] as const)
  priority!: 'P1' | 'P2' | 'P3';

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  photos?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  contractId?: string;

  @IsOptional()
  @IsInt()
  contractVersion?: number;

  @IsOptional()
  @IsObject()
  contractSnapshot?: Record<string, unknown>;
}
