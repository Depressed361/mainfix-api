import { Type } from 'class-transformer';
import { IsEnum, IsISO4217CurrencyCode, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateApprovalRequestDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountEstimate?: number;

  @IsOptional()
  @IsISO4217CurrencyCode()
  currency?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'] as const)
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
