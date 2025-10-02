import { IsOptional, IsString, Matches } from 'class-validator';

const DEC = /^(?:\d+)(?:\.\d{1,2})?$/;
// Accepts UUID-like strings used in seeds (looser than strict RFC versions)
const UUIDISH = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export class UpsertLaborCostDto {
  @Matches(UUIDISH) ticketId!: string;
  @IsOptional() @IsString() laborHours?: string;
  @IsOptional() @IsString() laborRate?: string;
  @IsOptional() @IsString() currency?: string;
}

export class UpsertPartDto {
  @Matches(UUIDISH) ticketId!: string;
  @IsOptional() @Matches(UUIDISH) id?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() label?: string;
  @IsString() qty!: string;
  @IsString() unitCost!: string;
}

export class RemovePartDto { @Matches(UUIDISH) ticketId!: string; @Matches(UUIDISH) id!: string }
