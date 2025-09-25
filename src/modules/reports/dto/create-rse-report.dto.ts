import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateRseReportDto {
  @IsUUID()
  companyId!: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
