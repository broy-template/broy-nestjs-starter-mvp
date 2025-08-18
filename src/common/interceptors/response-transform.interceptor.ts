// src/common/interceptors/transform.interceptor.ts

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, ApiStatus, IServiceResponse } from '../interfaces';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<IServiceResponse<T>, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((serviceResponse: IServiceResponse<T>) => {
        // Interceptor hanya perlu memetakan properti dari service response
        // ke API response.
        return {
          status: ApiStatus.SUCCESS,
          message: serviceResponse.message,
          data: serviceResponse.data,
          pagination: serviceResponse.pagination,
        };
      }),
    );
  }
}