import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTicketCommentDto {
  @IsUUID()
  @IsNotEmpty()
  authorUserId!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
