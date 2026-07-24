import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMembershipPlanDto {
  @IsNotEmpty({ message: 'Plan adı boş bırakılamaz.' })
  @IsString({ message: 'Plan adı metin olmalıdır.' })
  name: string;

  @IsNotEmpty({ message: 'Süre (ay) boş bırakılamaz.' })
  @IsNumber({}, { message: 'Süre sayı olmalıdır.' })
  durationMonths: number;

  @IsNotEmpty({ message: 'Fiyat boş bırakılamaz.' })
  @IsNumber({}, { message: 'Fiyat sayı olmalıdır.' })
  price: number;

  @IsString({ message: 'Açıklama metin olmalıdır.' })
  @IsOptional()
  description?: string;

  @IsBoolean({ message: 'Aktiflik durumu mantıksal değer olmalıdır.' })
  @IsOptional()
  isActive?: boolean;
  
  @IsBoolean({ message: 'PT dahil olma durumu mantıksal değer olmalıdır.' })
  @IsOptional()
  includesPersonalTraining?: boolean;

  @IsNumber({}, { message: 'PT seans sayısı sayı olmalıdır.' })
  @IsOptional()
  ptSessionsCount?: number;
}
