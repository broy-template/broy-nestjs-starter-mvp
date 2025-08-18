// src/common/helpers/service-response.helper.ts

import { IServiceResponse, PaginationInfo } from "../response/api-response";


export class ServiceResponse {
  /**
   * Untuk data tunggal.
   */
  static single<T>(data: T, message = 'Success'): IServiceResponse<T> {
    return { message, data };
  }

  /**
   * Untuk daftar data tanpa paginasi.
   */
  static list<T>(data: T[], message = 'Success'): IServiceResponse<T[]> {
    return { message, data };
  }

  /**
   * Untuk daftar data dengan paginasi.
   */
  static paginated<T>(
    data: T[],
    pagination: PaginationInfo,
    message = 'Success',
  ): IServiceResponse<T[]> {
    return { message, data, pagination };
  }

  /**
   * Untuk operasi DELETE yang sukses.
   */
  static deleted(message = 'Resource deleted successfully'): IServiceResponse<null> {
    return { message, data: null };
  }
}