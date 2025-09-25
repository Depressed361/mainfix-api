import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateSurveyDto {
  @IsUUID()
  @IsNotEmpty()
  respondentUserId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
