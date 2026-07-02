import { IsOptional, IsString } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsString()
  @IsOptional()
  status?: string;
}