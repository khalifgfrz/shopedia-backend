import { IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class UpdateUserRequest {
  @IsOptional()
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

  @IsOptional()
  image?: string;
}

export class UpdateAdminUserRequest {
  @IsOptional()
  @IsString()
  role: string;
}
