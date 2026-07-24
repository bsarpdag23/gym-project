import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'E-posta adresi boş bırakılamaz.' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email: string;

  @IsNotEmpty({ message: 'Şifre boş bırakılamaz.' })
  @IsString({ message: 'Şifre metin formatında olmalıdır.' })
  password: string;
}
