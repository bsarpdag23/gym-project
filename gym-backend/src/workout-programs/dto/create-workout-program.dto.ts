import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { PROGRAM_CATEGORIES } from '../program-category.util';

export class CreateWorkoutProgramDto {
  @IsString()
  name: string;

  @IsString() @IsOptional()
  description?: string;

  @IsString()
  difficulty: string;

  @IsNumber() @IsOptional()
  weeksCount?: number;

  @IsIn(PROGRAM_CATEGORIES)
  category: string;
}