import { IsUUID, IsDateString, IsOptional, IsIn } from 'class-validator';

export class GenerateRseReportDto {
  @IsUUID() companyId!: string;
  @IsDateString() periodStart!: string;
  @IsDateString() periodEnd!: string;
}

export class ListRseReportsQueryDto {
  @IsUUID() companyId!: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
}

export class ExportRseReportDto { @IsIn(['csv','pdf']) format!: 'csv' | 'pdf' }

