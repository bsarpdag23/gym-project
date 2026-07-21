import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  await app.listen(3001);
  console.log('💪 Backend çalışıyor → http://localhost:3001');
  console.log('📦 Veritabanı      → PostgreSQL (gym_db @ localhost:5432)');
}
bootstrap();