import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty({ message: 'Mesaj içeriği boş bırakılamaz.' })
  @IsString({ message: 'Mesaj metin olmalıdır.' })
  @MinLength(1, { message: 'Mesaj en az 1 karakter olmalıdır.' })
  @MaxLength(2000, { message: 'Mesaj en fazla 2000 karakter olabilir.' })
  content: string;
}
