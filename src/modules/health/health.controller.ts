import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '[PUBLIC] Check application health', description: '**[PUBLIC ACCESS]** Check the health status of the application and its dependencies. No authentication required.' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
  })
  async check() {
    return this.healthService.check();
  }
}
