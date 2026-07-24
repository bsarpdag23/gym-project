import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class RateProgramDto {
  @IsNotEmpty({ message: 'Puan boş bırakılamaz.' })
  @IsInt({ message: 'Puan tam sayı olmalıdır.' })
  @Min(1, { message: 'Puan en az 1 olmalıdır.' })
  @Max(5, { message: 'Puan en fazla 5 olmalıdır.' })
  rating: number;

  @IsString({ message: 'Yorum metin olmalıdır.' })
  @IsOptional()
  comment?: string;
}
