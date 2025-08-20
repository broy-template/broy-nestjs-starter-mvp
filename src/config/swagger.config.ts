import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const logger = new Logger('Swagger');
  
  // Only enable in non-production environments
  if (configService.get('app.nodeEnv') === 'production') {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle(configService.get('swagger.title') || 'Broy NestJS Starter MVP')
    .setDescription(configService.get('swagger.description') || 'A comprehensive NestJS starter template API documentation')
    .setVersion(configService.get('swagger.version') || '1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token (without Bearer prefix)',
        in: 'header',
      },
      'bearer', // This should match @ApiBearerAuth() in controllers
    )
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.yourdomain.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const apiPrefix = configService.get('app.apiPrefix');
  
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Broy API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .info .title { color: #1976d2 }
    `,
  });
  
  logger.log(`📚 Swagger documentation available at /${apiPrefix}/docs`);
}
