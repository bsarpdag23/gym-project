import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGymDto {
  @IsNotEmpty({ message: 'Salon adı boş bırakılamaz.' })
  @IsString({ message: 'Salon adı metin olmalıdır.' })
  name: string;

  @IsString({ message: 'Adres metin olmalıdır.' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'Telefon metin olmalıdır.' })
  @IsOptional()
  phone?: string;

  @IsNotEmpty({ message: 'Salon sahibi e-posta adresi boş bırakılamaz.' })
  @IsEmail({}, { message: 'Geçerli bir salon sahibi e-posta adresi giriniz.' })
  ownerEmail: string;

  @IsNotEmpty({ message: 'Salon sahibi adı boş bırakılamaz.' })
  @IsString({ message: 'Salon sahibi adı metin olmalıdır.' })
  ownerName: string;

  @IsNotEmpty({ message: 'Salon sahibi şifresi boş bırakılamaz.' })
  @IsString({ message: 'Salon sahibi şifresi metin olmalıdır.' })
  @MinLength(6, { message: 'Salon sahibi şifresi en az 6 karakter olmalıdır.' })
  ownerPassword: string;
}