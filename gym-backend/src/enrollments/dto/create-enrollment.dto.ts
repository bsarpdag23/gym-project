import { IsNumber } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNumber()
  planId: number;
}


// ─────────────────────────────────────────────────────────
// src/enrollments/dto/update-enrollment.dto.ts
// ─────────────────────────────────────────────────────────
import { IsOptional, IsString } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsString()
  @IsOptional()
  status?: string;
}