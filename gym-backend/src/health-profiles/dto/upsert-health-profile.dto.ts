import { IsIn, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpsertHealthProfileDto {
  @IsNumber() @Min(100) @Max(250)
  heightCm: number;

  @IsNumber() @Min(30) @Max(300)
  weightKg: number;

  @IsNumber() @Min(14) @Max(100)
  age: number;

  @IsIn(['male', 'female'])
  gender: string;

  @IsNumber() @Min(30) @Max(300)
  targetWeightKg: number;

  @IsNumber() @Min(1) @Max(7)
  weeklyWorkoutDays: number;

  @IsIn(['sedentary', 'light', 'moderate', 'active', 'very_active'])
  activityLevel: string;

  @IsNumber() @IsOptional() @Min(3) @Max(60)
  bodyFatPercentage?: number;
}