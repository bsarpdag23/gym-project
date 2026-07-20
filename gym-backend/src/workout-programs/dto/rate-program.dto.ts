import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RateProgramDto {
  @IsInt() @Min(1) @Max(5)
  rating: number;

  @IsString() @IsOptional()
  comment?: string;
}
