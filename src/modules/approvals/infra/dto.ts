import { IsUUID, IsOptional, IsString, IsIn, IsNumberString, IsDateString, IsArray, MinLength, MaxLength } from 'class-validator';
export type ApprovalStatus = 'PENDING'|'APPROVED'|'REJECTED';

export class CreateApprovalRequestDto {
  @IsUUID() ticketId!: string;
  @IsOptional() @IsString() @MaxLength(2000) reason?: string;
  @IsOptional() @IsNumberString() amountEstimate?: string; // "1234.56"
  @IsOptional() @IsString() @MinLength(3) @MaxLength(3) currency?: string; // default 'EUR'
}

export class DecideApprovalDto {
  @IsIn(['APPROVED','REJECTED']) decision!: 'APPROVED'|'REJECTED';
  @IsOptional() @IsString() @MaxLength(1000) note?: string;
}

export class ListApprovalRequestsQueryDto {
  @IsOptional() @IsUUID() companyId?: string;
  @IsOptional() @IsArray() siteIds?: string[];
  @IsOptional() @IsArray() buildingIds?: string[];
  @IsOptional() @IsArray() status?: ApprovalStatus[];
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  page?: number; pageSize?: number;
}

