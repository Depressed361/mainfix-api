import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateRoutingRuleDto {
  @IsUUID()
  @IsNotEmpty()
  contractVersionId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @IsObject()
  @IsNotEmpty()
  condition!: Record<string, unknown>;

  @IsObject()
  @IsNotEmpty()
  action!: Record<string, unknown>;
}
