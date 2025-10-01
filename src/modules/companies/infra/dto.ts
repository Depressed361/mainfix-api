import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCompanyDto { @IsString() name!: string }
export class UpdateCompanyDto { @IsOptional() @IsString() name?: string }

export class OnboardVendorForSiteDto {
  @IsUUID() siteId!: string;
  @IsString() vendorTeamName!: string;
  @IsOptional() @IsArray() initialMemberIds?: string[];
}

