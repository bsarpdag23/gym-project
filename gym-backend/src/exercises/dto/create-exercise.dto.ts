import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExerciseDto {
  @IsNotEmpty({ message: 'Egzersiz adı boş bırakılamaz.' })
  @IsString({ message: 'Egzersiz adı metin olmalıdır.' })
  name: string;

  @IsString({ message: 'Açıklama metin olmalıdır.' })
  @IsOptional()
  description?: string;

  @IsNotEmpty({ message: 'Kategori boş bırakılamaz.' })
  @IsString({ message: 'Kategori metin olmalıdır.' })
  category: string;

  @IsString({ message: 'Kas grubu metin olmalıdır.' })
  @IsOptional()
  muscleGroup?: string;

  @IsString({ message: 'Hedef türü metin olmalıdır.' })
  @IsOptional()
  goalType?: string;

  @IsString({ message: 'Ekipman metin olmalıdır.' })
  @IsOptional()
  equipment?: string;

  @IsNumber({}, { message: 'Set sayısı sayı olmalıdır.' })
  @IsOptional()
  sets?: number;

  @IsNumber({}, { message: 'Tekrar sayısı sayı olmalıdır.' })
  @IsOptional()
  reps?: number;

  @IsString({ message: 'Video URL metin olmalıdır.' })
  @IsOptional()
  videoUrl?: string;
}
