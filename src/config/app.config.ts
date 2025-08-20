import { registerAs } from '@nestjs/config';

// Konfigurasi database (DATABASE_URL)
export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));

// Konfigurasi JWT (JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN)
export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '60m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));

// Konfigurasi aplikasi utama (NODE_ENV, PORT, API_PREFIX, CORS_ORIGINS)
export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  timezone: process.env.TIMEZONE || 'UTC',
}));

// Konfigurasi rate limit/throttle (THROTTLE_TTL, THROTTLE_LIMIT)
export const throttleConfig = registerAs('throttle', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
  limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
}));

// Konfigurasi logging (LOG_LEVEL)
export const logConfig = registerAs('log', () => ({
  level: process.env.LOG_LEVEL || 'info',
}));

// Konfigurasi watermark
export const watermarkConfig = registerAs('watermark', () => ({
  author: 'Roy Aziz Barera',
  contact: '@royazizbarera',
  github: 'github.com/forscy',
  license: 'Proprietary',
  copyright: '© 2025 Roy Aziz Barera',
  buildDate: new Date().toISOString(),
  version: '1.0.0',
}));

// Konfigurasi Swagger documentation
export const swaggerConfig = registerAs('swagger', () => ({
  title: process.env.SWAGGER_TITLE || 'Broy NestJS Starter MVP API',
  description: process.env.SWAGGER_DESCRIPTION || 'Comprehensive NestJS starter template API documentation',
  version: process.env.SWAGGER_VERSION || '1.0.0',
  enabled: process.env.ENABLE_SWAGGER === 'true',
}));
