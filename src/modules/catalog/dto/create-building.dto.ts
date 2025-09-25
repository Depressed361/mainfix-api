import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBuildingDto {
  @IsUUID()
  @IsNotEmpty()
  siteId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}
