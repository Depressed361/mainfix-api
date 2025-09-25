import { Type } from 'class-transformer';
import { IsISO4217CurrencyCode, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTicketCostDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  laborHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  laborRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  partsCost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total?: number;

  @IsOptional()
  @IsISO4217CurrencyCode()
  currency?: string;
}
