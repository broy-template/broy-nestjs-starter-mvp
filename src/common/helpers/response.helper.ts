import { HttpStatus } from '@nestjs/common';
import { ApiResponse, PaginationInfo } from '../interfaces';
import { ApiStatus } from '../response/api-response';

export class ResponseHelper {
  /**
   * Membuat response sukses untuk single data
   */
  static success<T>(
    data: T,
    message: string = 'Operasi berhasil',
    statusCode: HttpStatus = HttpStatus.OK
  ): ApiResponse<T> {
    return {
      status: ApiStatus.SUCCESS,
      message,
      data,
    };
  }

  /**
   * Membuat response sukses untuk list data
   */
  static successList<T>(
    data: T[],
    message: string = 'Data berhasil diambil'
  ): ApiResponse<T[]> {
    return {
      status: ApiStatus.SUCCESS,
      message,
      data,
    };
  }

  /**
   * Membuat response sukses dengan pagination
   */
  static successPaginated<T>(
    data: T[],
    pagination: PaginationInfo,
    message: string = 'Data berhasil diambil'
  ): ApiResponse<T[]> {
    return {
      status: ApiStatus.SUCCESS,
      message,
      data,
      pagination,
    };
  }

  /**
   * Membuat response untuk operasi tanpa data (null response)
   */
  static successNoData(message: string = 'Operasi berhasil'): ApiResponse<null> {
    return {
      status: ApiStatus.SUCCESS,
      message,
    };
  }

  /**
   * Membuat response untuk operasi create
   */
  static created<T>(
    data: T,
    message: string = 'Data berhasil dibuat'
  ): ApiResponse<T> {
    return {
      status: ApiStatus.SUCCESS,
      message,
      data,
    };
  }

  /**
   * Membuat response untuk operasi update
   */
  static updated<T>(
    data: T,
    message: string = 'Data berhasil diperbarui'
  ): ApiResponse<T> {
    return {
      status: ApiStatus.SUCCESS,
      message,
      data,
    };
  }

  /**
   * Membuat response untuk operasi delete
   */
  static deleted(message: string = 'Data berhasil dihapus'): ApiResponse<null> {
    return {
      status: ApiStatus.SUCCESS,
      message,
    };
  }

  /**
   * Format error messages dari validation errors
   */
  static formatValidationErrors(errors: any[]): string {
    return errors
      .map(error => Object.values(error.constraints || {}).join(', '))
      .join('; ');
  }

  /**
   * Sanitize data untuk response (remove sensitive fields)
   */
  static sanitizeUserData(user: any): any {
    const { password, hashedRefreshToken, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
