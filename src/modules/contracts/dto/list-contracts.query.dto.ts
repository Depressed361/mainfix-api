import { Expose, Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

export class ListContractsQueryDto {
  @Expose({ name: 'site_id' })
  @Transform(({ value }) => (typeof value === 'string' && value.length === 0 ? undefined : value))
  @IsOptional()
  @IsUUID()
  siteId?: string;
}
