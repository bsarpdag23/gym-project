import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNotEmpty({ message: 'Plan ID boş bırakılamaz.' })
  @IsNumber({}, { message: 'Plan ID sayı olmalıdır.' })
  planId: number;
}

export class UpdateEnrollmentDto {
  @IsString({ message: 'Durum metin olmalıdır.' })
  @IsOptional()
  status?: string;
}