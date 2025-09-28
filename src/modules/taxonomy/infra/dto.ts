import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  IsInt,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  key!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  label!: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  key?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  label?: string;
}

export class CreateSkillDto {
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  key!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  label!: string;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  key?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  label?: string;
}

export class MapCategorySkillDto {
  @IsUUID()
  categoryId!: string;

  @IsUUID()
  skillId!: string;
}

export class ListCategoriesQueryDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeSkills?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}

export class ListSkillsQueryDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeCategories?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
