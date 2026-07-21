import { IsEmail, IsOptional, IsString, MinLength, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  gymId?: number;
}