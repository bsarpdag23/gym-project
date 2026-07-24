import { IsIn, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpsertHealthProfileDto {
  @IsNotEmpty({ message: 'Boy bilgisi boş bırakılamaz.' })
  @IsNumber({}, { message: 'Boy sayı olmalıdır.' })
  @Min(100, { message: 'Boy en az 100 cm olmalıdır.' })
  @Max(250, { message: 'Boy en fazla 250 cm olmalıdır.' })
  heightCm: number;

  @IsNotEmpty({ message: 'Kilo bilgisi boş bırakılamaz.' })
  @IsNumber({}, { message: 'Kilo sayı olmalıdır.' })
  @Min(30, { message: 'Kilo en az 30 kg olmalıdır.' })
  @Max(300, { message: 'Kilo en fazla 300 kg olmalıdır.' })
  weightKg: number;

  @IsNotEmpty({ message: 'Yaş bilgisi boş bırakılamaz.' })
  @IsNumber({}, { message: 'Yaş sayı olmalıdır.' })
  @Min(14, { message: 'Yaş en az 14 olmalıdır.' })
  @Max(100, { message: 'Yaş en fazla 100 olmalıdır.' })
  age: number;

  @IsNotEmpty({ message: 'Cinsiyet seçimi boş bırakılamaz.' })
  @IsIn(['male', 'female'], { message: 'Geçersiz cinsiyet seçimi.' })
  gender: string;

  @IsNotEmpty({ message: 'Hedef kilo bilgisi boş bırakılamaz.' })
  @IsNumber({}, { message: 'Hedef kilo sayı olmalıdır.' })
  @Min(30, { message: 'Hedef kilo en az 30 kg olmalıdır.' })
  @Max(300, { message: 'Hedef kilo en fazla 300 kg olmalıdır.' })
  targetWeightKg: number;

  @IsNotEmpty({ message: 'Haftalık idman günü boş bırakılamaz.' })
  @IsNumber({}, { message: 'Haftalık idman günü sayı olmalıdır.' })
  @Min(1, { message: 'Haftalık idman günü en az 1 gün olmalıdır.' })
  @Max(7, { message: 'Haftalık idman günü en fazla 7 gün olmalıdır.' })
  weeklyWorkoutDays: number;

  @IsNotEmpty({ message: 'Aktivite seviyesi boş bırakılamaz.' })
  @IsIn(['sedentary', 'light', 'moderate', 'active', 'very_active'], { message: 'Geçersiz aktivite seviyesi.' })
  activityLevel: string;

  @IsNumber({}, { message: 'Yağ oranı sayı olmalıdır.' })
  @IsOptional()
  @Min(3, { message: 'Yağ oranı en az %3 olmalıdır.' })
  @Max(60, { message: 'Yağ oranı en fazla %60 olmalıdır.' })
  bodyFatPercentage?: number;
}