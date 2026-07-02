import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMembershipPlanDto {
  @IsString()
  name: string;

  @IsNumber()
  durationMonths: number;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
  
  @IsBoolean()
  @IsOptional()
  includesPersonalTraining?: boolean;
}
