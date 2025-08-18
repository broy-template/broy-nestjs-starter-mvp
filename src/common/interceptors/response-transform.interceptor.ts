import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Jika response sudah dalam format ApiResponse, return as is
        if (data && typeof data === 'object' && 'status' in data) {
          return data;
        }

        // Transform ke format standar
        return {
          status: 'success',
          message: 'Operation completed successfully',
          data,
        };
      }),
    );
  }
}
