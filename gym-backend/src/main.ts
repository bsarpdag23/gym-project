import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001);
  console.log('💪 Backend çalışıyor → http://localhost:3001');
  console.log('📦 Veritabanı      → PostgreSQL (gym_db @ localhost:5432)');
}
bootstrap();