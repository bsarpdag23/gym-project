import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGymDto {
  @IsString()
  name: string;

  @IsString() @IsOptional()
  address?: string;

  @IsString() @IsOptional()
  phone?: string;

  @IsEmail()
  ownerEmail: string;

  @IsString()
  ownerName: string;

  @IsString() @MinLength(6)
  ownerPassword: string;
}