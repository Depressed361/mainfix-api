import { IsArray, IsDateString, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class SubmitSurveyDto { @IsUUID() ticketId!: string; @IsInt() @Min(1) @Max(5) rating!: number; @IsOptional() @IsString() comment?: string }
export class ListSurveysQueryDto { @IsOptional() @IsUUID() companyId?: string; @IsOptional() @IsArray() siteIds?: string[]; @IsOptional() @IsDateString() from?: string; @IsOptional() @IsDateString() to?: string; @IsOptional() page?: number; @IsOptional() pageSize?: number }

