import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Length(2, 64)
  key?: string;

  @IsOptional()
  @IsString()
  @Length(2, 128)
  label?: string;
}
