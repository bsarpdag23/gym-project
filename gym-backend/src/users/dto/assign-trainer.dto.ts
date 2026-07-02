import { IsInt, IsOptional } from 'class-validator';

export class AssignTrainerDto {
  @IsOptional()
  @IsInt()
  trainerId: number | null;   // null → atamayı kaldır
}