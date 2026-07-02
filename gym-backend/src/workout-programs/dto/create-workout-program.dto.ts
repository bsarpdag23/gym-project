import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWorkoutProgramDto {
  @IsString()
  name: string;

  @IsString() @IsOptional()
  description?: string;

  @IsString()
  difficulty: string;

  @IsNumber() @IsOptional()
  weeksCount?: number;
}