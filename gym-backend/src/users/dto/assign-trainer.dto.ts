import { IsInt, IsOptional } from 'class-validator';

export class AssignTrainerDto {
  @IsOptional()
  @IsInt({ message: 'Trainer ID tam sayı olmalıdır.' })
  trainerId: number | null;   // null → atamayı kaldır
}