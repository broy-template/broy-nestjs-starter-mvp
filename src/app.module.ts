import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { WatermarkInterceptor } from './common/interceptors/watermark.interceptor';
import { PrismaModule } from './common/prisma.module';
import { validationSchema } from './config/validation.config';
import {
  databaseConfig,
  jwtConfig,
  appConfig,
  throttleConfig,
  logConfig,
  watermarkConfig,
} from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig, throttleConfig, logConfig, watermarkConfig],
      validationSchema,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
            limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
          },
        ],
      }),
    }),

    // Structured logging
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: {
          level: process.env.LOG_LEVEL || 'info',
          transport:
            process.env.NODE_ENV === 'development'
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'hostname,pid',
                  },
                }
              : undefined,
          formatters: {
            level: (label) => {
              return { level: label };
            },
          },
        },
      }),
    }),

    // Feature modules
    PrismaModule, // Global Prisma module
    AuthModule,
    UserModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global watermark interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: WatermarkInterceptor,
    },
    // Global guards - order matters!
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Rate limiting guard - runs first
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Authentication guard - runs second
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Authorization guard - runs third
    },
  ],
})
export class AppModule {}
