import { IsInt, IsNotEmpty, IsObject, IsOptional, Min } from 'class-validator';

export class CreateContractVersionDto {
  @IsInt()
  @Min(1)
  version!: number;

  @IsObject()
  @IsNotEmpty()
  coverage!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  escalation?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  approvals?: Record<string, unknown>;
}
