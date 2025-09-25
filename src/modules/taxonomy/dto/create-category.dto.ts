import { IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(2, 64)
  key!: string;

  @IsString()
  @Length(2, 128)
  label!: string;
}
