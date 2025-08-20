// src/common/interceptors/transform.interceptor.ts

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiStatus, ApiResponse } from '../interfaces';
import { SKIP_RESPONSE_TRANSFORM_KEY } from '../decorators/skip-response-transform.decorator';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<ApiResponse<T>, ApiResponse<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const skipTransform = this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipTransform) {
      return next.handle();
    }

    return next.handle().pipe(
      map((serviceResponse: ApiResponse<T> | any) => {
        // Jika response tidak memiliki struktur ApiResponse (seperti file stream),
        // kembalikan response asli tanpa transformasi
        if (!serviceResponse || typeof serviceResponse !== 'object' || !serviceResponse.hasOwnProperty('message')) {
          return serviceResponse;
        }

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