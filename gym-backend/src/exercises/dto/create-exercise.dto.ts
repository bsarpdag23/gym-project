import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  name: string;

  @IsString() @IsOptional()
  description?: string;

  @IsString()
  category: string;

  @IsString() @IsOptional()
  muscleGroup?: string;

  @IsString() @IsOptional()
  goalType?: string;

  @IsString() @IsOptional()
  equipment?: string;

  @IsNumber() @IsOptional()
  sets?: number;

  @IsNumber() @IsOptional()
  reps?: number;

  @IsString() @IsOptional()
  videoUrl?: string;

  
}
