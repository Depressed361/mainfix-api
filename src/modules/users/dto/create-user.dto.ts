import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  @IsNotEmpty()
  companyId!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  displayName!: string;

  @IsEnum(['occupant', 'maintainer', 'manager', 'approver', 'admin'] as const)
  role!: 'occupant' | 'maintainer' | 'manager' | 'approver' | 'admin';

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
