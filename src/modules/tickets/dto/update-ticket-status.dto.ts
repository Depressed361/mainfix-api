import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTicketStatusDto {
  @IsEnum([
    'draft',
    'open',
    'assigned',
    'in_progress',
    'awaiting_confirmation',
    'resolved',
    'closed',
    'cancelled',
  ])
  status!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  actorId?: string;
}
