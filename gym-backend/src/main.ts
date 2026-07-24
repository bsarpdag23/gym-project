import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

function translateValidationError(msg: string): string {
  if (msg.includes('must be an email')) return 'Geçerli bir e-posta adresi giriniz.';
  if (msg.includes('should not be empty')) return 'Bu alan boş bırakılamaz.';
  if (msg.includes('must be a string')) return 'Bu alan metin formatında olmalıdır.';
  if (msg.includes('must be longer than or equal to')) {
    const num = msg.match(/\d+/);
    return `Bu alan en az ${num ? num[0] : ''} karakter olmalıdır.`;
  }
  if (msg.includes('must be shorter than or equal to')) {
    const num = msg.match(/\d+/);
    return `Bu alan en fazla ${num ? num[0] : ''} karakter olabilir.`;
  }
  if (msg.includes('must be an integer number')) return 'Bu alan tam sayı olmalıdır.';
  if (msg.includes('must be a number')) return 'Bu alan sayı olmalıdır.';
  if (msg.includes('must be a boolean')) return 'Bu alan boolean (doğru/yanlış) olmalıdır.';
  if (msg.includes('must be one of the following values')) return 'Geçersiz değer seçimi.';
  return msg;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.flatMap((err) => {
        if (err.constraints) {
          return Object.values(err.constraints).map((msg) => translateValidationError(msg));
        }
        return [];
      });
      return new BadRequestException(messages);
    },
  }));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  await app.listen(3001);
  console.log('💪 Backend çalışıyor → http://localhost:3001');
  console.log('📦 Veritabanı      → PostgreSQL (gym_db @ localhost:5432)');
}
bootstrap();