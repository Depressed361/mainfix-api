import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSiteDto {
  @IsUUID()
  @IsNotEmpty()
  companyId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
