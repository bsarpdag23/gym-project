import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty({ message: 'Rol alanı boş bırakılamaz.' })
  @IsIn(['admin', 'trainer', 'member'], { message: 'Geçersiz rol seçimi.' })
  role: string;
}