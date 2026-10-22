import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useBodyParser('json', { limit: '256kb' });
  const config = app.get(ConfigService);
  app.enableCors({ origin: config.getOrThrow<string>('FRONTEND_ORIGIN') });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.enableShutdownHooks();
  await app.listen(config.getOrThrow<number>('PORT'));
}

bootstrap().catch(() => {
  Logger.error('No se pudo iniciar el backend. Revisá la configuración y el acceso a Atlas.');
  process.exitCode = 1;
});
