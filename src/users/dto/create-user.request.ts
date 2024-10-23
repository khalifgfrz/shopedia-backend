import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserRequest {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  image?: string;
}
