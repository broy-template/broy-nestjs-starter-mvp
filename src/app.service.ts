import { Injectable } from '@nestjs/common';
import { ApiResponse, ApiStatus } from './common/interfaces';

@Injectable()
export class AppService {
  getAppInfo(): ApiResponse {
    return {
      status: ApiStatus.SUCCESS,
      message: 'Broy NestJS Starter MVP is running successfully!',
      data: {
        name: 'Broy NestJS Starter MVP',
        version: '1.0.0',
        description: 'A comprehensive NestJS starter template following best practices',
        author: 'Roy Aziz Barera',
        github: 'https://github.com/forscy',
        documentation: '/api/v1/docs',
        health: '/api/v1/health',
      },
    };
  }
}
