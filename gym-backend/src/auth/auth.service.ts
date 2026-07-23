import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new BadRequestException('Bu e-posta adresi zaten kullanılmaktadır.');
    }

    if (dto.phone && dto.phone.trim()) {
      const cleanPhone = dto.phone.trim();
      const existingPhone = await this.usersRepo.findOne({ where: { phone: cleanPhone } });
      if (existingPhone) {
        throw new BadRequestException('Bu telefon numarası zaten kullanılmaktadır.');
      }
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      ...dto,
      password: hashed,
      role: UserRole.MEMBER,   // kim ne gönderirse göndersin, herkes member
      gymId: dto.gymId ?? 1,   // varsayılan olarak ilk salona bağlanır
    });
    await this.usersRepo.save(user);
    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    const payload = { email: user.email, sub: user.id, role: user.role, gymId: user.gymId };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, gymId: user.gymId },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı.');
    }

    // 6 haneli rastgele kod üret (simülasyon kolaylığı için)
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // 15 dakika geçerli

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await this.usersRepo.save(user);

    console.log(`🔑 ŞİFRE SIFIRLAMA KODU (Email: ${email}): ${token}`);

    return {
      message: 'Şifre sıfırlama kodu gönderildi (Simülasyon).',
      code: token, // Simülasyon kolaylığı için ön yüze de dönüyoruz
    };
  }

  async resetPassword(token: string, passwordStr: string) {
    const user = await this.usersRepo.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new BadRequestException('Geçersiz sıfırlama kodu.');
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires.getTime() < Date.now()) {
      throw new BadRequestException('Sıfırlama kodunun süresi dolmuş.');
    }

    const hashed = await bcrypt.hash(passwordStr, 10);
    user.password = hashed;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.usersRepo.save(user);

    return { message: 'Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.' };
  }
}
