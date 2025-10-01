import { IsUUID, IsOptional, IsString, Matches } from 'class-validator';

const DEC = /^(?:\d+)(?:\.\d{1,2})?$/;

export class UpsertLaborCostDto {
  @IsUUID() ticketId!: string;
  @IsOptional() @IsString() laborHours?: string;
  @IsOptional() @IsString() laborRate?: string;
  @IsOptional() @IsString() currency?: string;
}

export class UpsertPartDto {
  @IsUUID() ticketId!: string;
  @IsOptional() @IsUUID() id?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() label?: string;
  @IsString() qty!: string;
  @IsString() unitCost!: string;
}

export class RemovePartDto { @IsUUID() ticketId!: string; @IsUUID() id!: string }
