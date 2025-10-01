import { IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import type { TicketPriority, TicketStatus, TicketLinkType } from '../domain/ports';

export class CreateTicketDto {
  @IsUUID() siteId!: string;
  @IsOptional() @IsUUID() buildingId?: string;
  @IsOptional() @IsUUID() locationId?: string;
  @IsOptional() @IsUUID() assetId?: string;
  @IsUUID() categoryId!: string;
  @IsIn(['P1','P2','P3']) priority!: TicketPriority;
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsUUID() contractVersionId!: string;
}

export class AssignTicketDto { @IsOptional() @IsUUID() teamId?: string }
export class ChangeStatusDto { @IsIn(['open','assigned','in_progress','awaiting_confirmation','resolved','closed','cancelled']) to!: TicketStatus }
export class AddCommentDto { @IsString() body!: string }
export class LinkTicketsDto { @IsUUID() targetTicketId!: string; @IsIn(['duplicate','related','parent','child']) type!: TicketLinkType }

export class ListTicketsQueryDto {
  @IsOptional() @IsUUID() companyId?: string;
  @IsOptional() @IsArray() siteIds?: string[];
  @IsOptional() @IsArray() buildingIds?: string[];
  @IsOptional() @IsArray() teamIds?: string[];
  @IsOptional() @IsUUID() reporterId?: string;
  @IsOptional() @IsArray() status?: TicketStatus[];
  @IsOptional() @IsArray() priority?: TicketPriority[];
  @IsOptional() @IsArray() categoryIds?: string[];
  @IsOptional() text?: string;
  @IsOptional() @IsDateString() createdFrom?: string;
  @IsOptional() @IsDateString() createdTo?: string;
  @IsOptional() @IsIn(['createdAt','priority','resolveDueAt','ackDueAt']) sortBy?: 'createdAt'|'priority'|'resolveDueAt'|'ackDueAt';
  @IsOptional() @IsIn(['asc','desc']) sortDir?: 'asc'|'desc';
  @IsOptional() @IsInt() @Min(1) page?: number;
  @IsOptional() @IsInt() @Min(1) pageSize?: number;
}

