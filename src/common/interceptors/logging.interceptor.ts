import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const correlationId = uuidv4();

    // Tambahkan correlation ID ke request untuk bisa digunakan di service lain
    (request as any).correlationId = correlationId;

    const now = Date.now();

    this.logger.log(
      `📥 Incoming ${method} ${url}`,
      {
        correlationId,
        method,
        url,
        userAgent: request.get('User-Agent'),
        ip: request.ip,
      },
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.log(
          `📤 Completed ${method} ${url} in ${duration}ms`,
          {
            correlationId,
            method,
            url,
            duration,
          },
        );
      }),
    );
  }
}
