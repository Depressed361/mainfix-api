import { Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

export class AssetScopeDto {
  @Transform(({ value }) => (typeof value === 'string' && value.length > 0 ? value : undefined))
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
