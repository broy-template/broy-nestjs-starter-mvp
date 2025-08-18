// src/common/interceptors/transform.interceptor.ts

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiStatus, IServiceResponse } from '../interfaces';

// Interface untuk API response final
export interface IApiResponse<T> {
  status: 'success';
  message: string;
  data?: T;
  pagination?: any;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<IServiceResponse<T>, IApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IApiResponse<T>> {
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