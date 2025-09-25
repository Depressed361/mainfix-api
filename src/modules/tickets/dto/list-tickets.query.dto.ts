import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

const emptyToUndefined = ({ value }: { value?: string }) =>
  typeof value === 'string' && value.length === 0 ? undefined : value;

export class ListTicketsQueryDto {
  @Expose({ name: 'site_id' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @Expose({ name: 'building_id' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID()
  buildingId?: string;

  @Expose({ name: 'company_id' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @Expose({ name: 'assignee_team_id' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID()
  assigneeTeamId?: string;

  @IsOptional()
  @IsEnum(
    [
      'draft',
      'open',
      'assigned',
      'in_progress',
      'awaiting_confirmation',
      'resolved',
      'closed',
      'cancelled',
    ],
    { message: 'Invalid ticket status filter' },
  )
  status?: string;

  @IsOptional()
  @IsEnum(['P1', 'P2', 'P3'] as const)
  priority?: 'P1' | 'P2' | 'P3';
}
