import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty({ message: 'E-posta adresi boş bırakılamaz.' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email: string;

  @IsNotEmpty({ message: 'Ad Soyad alanı boş bırakılamaz.' })
  @IsString({ message: 'Ad Soyad metin formatında olmalıdır.' })
  fullName: string;

  @IsNotEmpty({ message: 'Şifre boş bırakılamaz.' })
  @IsString({ message: 'Şifre metin formatında olmalıdır.' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  password: string;

  @IsString({ message: 'Telefon numarası metin formatında olmalıdır.' })
  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsInt({ message: 'Salon ID tam sayı olmalıdır.' })
  @Type(() => Number)
  gymId?: number;
}