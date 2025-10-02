import { IsOptional, IsString, IsIn, IsNumberString, IsDateString, IsArray, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
export type ApprovalStatus = 'PENDING'|'APPROVED'|'REJECTED';
const UUIDISH = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export class CreateApprovalRequestDto {
  @Matches(UUIDISH) ticketId!: string;
  @IsOptional() @IsString() @MaxLength(2000) reason?: string;
  @IsOptional() @IsNumberString() amountEstimate?: string; // "1234.56"
  @IsOptional() @IsString() @MinLength(3) @MaxLength(3) currency?: string; // default 'EUR'
}

export class DecideApprovalDto {
  @IsIn(['APPROVED','REJECTED']) decision!: 'APPROVED'|'REJECTED';
  @IsOptional() @IsString() @MaxLength(1000) note?: string;
}

export class ListApprovalRequestsQueryDto {
  @IsOptional() @Matches(UUIDISH) companyId?: string;
  @IsOptional() @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined)) @IsArray() siteIds?: string[];
  @IsOptional() @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined)) @IsArray() buildingIds?: string[];
  @IsOptional() @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined)) @IsArray() status?: ApprovalStatus[];
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  page?: number; pageSize?: number;
}
