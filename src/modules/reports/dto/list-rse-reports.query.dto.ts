import { Expose, Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ListRseReportsQueryDto {
  @Expose({ name: 'company_id' })
  @Transform(({ value, obj }) => value ?? obj.company_id ?? obj.companyId)
  @IsUUID()
  @IsNotEmpty()
  companyId!: string;
}
