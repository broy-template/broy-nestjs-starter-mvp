import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getAppInfo', () => {
    it('should return application info', () => {
      expect(appController.getAppInfo()).toEqual({
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
      });
    });
  });
});
