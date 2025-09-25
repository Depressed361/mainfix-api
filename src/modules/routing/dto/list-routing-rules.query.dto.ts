import { Expose, Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

export class ListRoutingRulesQueryDto {
  @Expose({ name: 'contract_version_id' })
  @Transform(({ value }) => (typeof value === 'string' && value.length === 0 ? undefined : value))
  @IsOptional()
  @IsUUID()
  contractVersionId?: string;
}
