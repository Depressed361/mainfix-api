import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail() email!: string;
  @MinLength(6) password!: string;

  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsString() siteId?: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsNotEmpty() password!: string;
}
