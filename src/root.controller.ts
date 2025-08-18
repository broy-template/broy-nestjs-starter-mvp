import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Application')
@Controller()
export class RootController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({
    status: 200,
    description: 'API information and available endpoints',
  })
  getApiInfo() {
    return {
      message: 'Broy NestJS Starter MVP API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        health: '/api/v1/health',
        docs: '/api/v1/docs',
      },
      description: 'A comprehensive NestJS starter template following best practices',
    };
  }
}
