import { IsIn, IsOptional, IsUUID } from 'class-validator';
import type { SlaType, TicketPriority } from '../domain/ports';

export class RecomputeSlaDto { @IsUUID() ticketId!: string; @IsIn(['P1','P2','P3']) newPriority!: TicketPriority }
export class PauseSlaDto { @IsUUID() ticketId!: string; @IsOptional() reason?: string }
export class ResumeSlaDto { @IsUUID() ticketId!: string }
export class ListBreachesQueryDto { @IsOptional() @IsUUID() companyId?: string; @IsOptional() siteIds?: string[]; @IsOptional() buildingIds?: string[]; @IsOptional() teamIds?: string[]; @IsOptional() @IsIn(['ack','resolve'], { each: true }) types?: SlaType[]; @IsOptional() from?: string; @IsOptional() to?: string; @IsOptional() page?: number; @IsOptional() pageSize?: number }

