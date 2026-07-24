import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PROGRAM_CATEGORIES } from '../program-category.util';

export class CreateWorkoutProgramDto {
  @IsNotEmpty({ message: 'Program adı boş bırakılamaz.' })
  @IsString({ message: 'Program adı metin olmalıdır.' })
  name: string;

  @IsString({ message: 'Açıklama metin olmalıdır.' })
  @IsOptional()
  description?: string;

  @IsNotEmpty({ message: 'Zorluk seviyesi boş bırakılamaz.' })
  @IsString({ message: 'Zorluk seviyesi metin olmalıdır.' })
  difficulty: string;

  @IsNumber({}, { message: 'Hafta sayısı sayı olmalıdır.' })
  @IsOptional()
  weeksCount?: number;

  @IsNotEmpty({ message: 'Kategori boş bırakılamaz.' })
  @IsIn(PROGRAM_CATEGORIES, { message: 'Geçersiz kategori seçildi.' })
  category: string;
}