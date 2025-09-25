import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateContractDto {
  @IsUUID()
  @IsNotEmpty()
  siteId!: string;

  @IsOptional()
  @IsUUID()
  providerCompanyId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
