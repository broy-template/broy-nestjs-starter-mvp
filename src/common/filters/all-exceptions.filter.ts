import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiResponse } from '../interfaces';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errorCode: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || exception.message;
        errorCode = responseObj.errorCode;
      } else {
        message = exception.message;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      this.logger.error('Unexpected error:', exception);
    }

    const errorResponse: ApiResponse = {
      status: 'failed',
      message,
      statusCode: status,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log error untuk monitoring
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      {
        statusCode: status,
        path: request.url,
        method: request.method,
        errorCode,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
    );

    response.status(status).json(errorResponse);
  }
}
