/**
 * Copyright (c) 2025 Roy Aziz Barera
 * 
 * This software is proprietary and confidential.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * @author Roy Aziz Barera <@royazizbarera>
 * @github forscy
 * @version 1.0.0
 * @license MIT
 */

/**
 * File utama untuk bootstrap aplikasi NestJS.
 *
 * - Mengatur global prefix untuk semua endpoint API.
 * - Mengaktifkan validasi global (class-validator).
 * - Mendaftarkan global interceptor untuk logging, response formatting, dan serialization.
 * - Mendaftarkan global exception filter untuk error handling standar.
 * - Mengaktifkan Swagger (OpenAPI) untuk dokumentasi API otomatis.
 * - Mengaktifkan Helmet untuk security headers.
 * - Mengaktifkan rate limiting (Throttler).
 *
 * Semua response API akan diformat secara konsisten sesuai standar JSON API yang sudah disepakati,
 * menggunakan GlobalResponseInterceptor dan AllExceptionsFilter.
 *
 * Untuk menambah/mengubah behavior global, lakukan di file ini.
 */
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // Global prefix
  const apiPrefix = configService.get('app.apiPrefix');
  app.setGlobalPrefix(apiPrefix);

  // Security
  app.use(helmet());
  
  // CORS
  const corsOrigins = configService.get('app.corsOrigins');
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Fix for legacy route converter warning - serve static files with proper route pattern
  const express = require('express');
  app.use('/assets', express.static('public'));

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ClassSerializerInterceptor(reflector),
    new ResponseTransformInterceptor(reflector),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new PrismaClientExceptionFilter());

  // Swagger documentation
  setupSwagger(app);

  const port = configService.get('app.port');
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`🔍 Health check available at: http://localhost:${port}/${apiPrefix}/health`);
}

bootstrap().catch((error) => {
  Logger.error('❌ Application failed to start:', error);
  process.exit(1);
});
