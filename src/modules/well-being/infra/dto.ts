import { IsArray, IsDateString, IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpsertSiteScoreDto { @IsUUID() siteId!: string; @IsDateString() periodStart!: string; @IsDateString() periodEnd!: string }
export class RebuildRangeDto { @IsUUID() companyId!: string; @IsDateString() periodStart!: string; @IsDateString() periodEnd!: string; @IsIn(['month','quarter','year']) granularity!: 'month'|'quarter'|'year' }
export class ListSiteScoresQueryDto { @IsArray() siteIds!: string[]; @IsOptional() @IsDateString() from?: string; @IsOptional() @IsDateString() to?: string; @IsOptional() @IsInt() @Min(1) page?: number; @IsOptional() @IsInt() @Min(1) pageSize?: number }

