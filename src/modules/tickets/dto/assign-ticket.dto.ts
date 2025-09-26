import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class AssignTicketDto {
  @IsOptional()
  @IsUUID()
  teamId!: string;

  @IsOptional()
  @IsBoolean()
  auto?: boolean;

  @IsOptional()
  @IsUUID()
  actorId?: string;
}
