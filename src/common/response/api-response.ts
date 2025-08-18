// Status Enum
export enum ApiStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}


// Pagination info following the requested standard
export interface PaginationInfo {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
}


/**
 * Interface utama untuk semua respons sukses dari service
 */
export interface IServiceResponse<T = any> {
  message: string;
  data?: T;
  pagination?: PaginationInfo;
}

// Base API Response interface (success)
export interface ApiResponse<T = any> {
  status: ApiStatus.SUCCESS;
  message: string;
  data?: T;
  pagination?: PaginationInfo;
}

// Error API Response interface
export interface ApiErrorResponse {
  status: ApiStatus.FAILED;
  message: string;
  statusCode: number;
  errorCode?: string;
  timestamp: string;
  path: string;
}

// Success response builder
export class SuccessResponse {
  static single<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      status: ApiStatus.SUCCESS,
      message,
      data,
    };
  }

  static list<T>(data: T[], message = 'Success'): ApiResponse<T[]> {
    return {
      status: ApiStatus.SUCCESS,
      message,
      data,
    };
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationInfo,
    message = 'Success',
  ): ApiResponse<T[]> {
    return {
      status: ApiStatus.SUCCESS,
      message,
      data,
      pagination,
    };
  }

  static deleted(message = 'Resource deleted successfully'): ApiResponse<null> {
    return {
      status: ApiStatus.SUCCESS,
      message,
    };
  }
}

// Error response builder
export class ErrorResponse {
  static failed(
    message: string,
    statusCode: number,
    path: string,
    errorCode?: string,
    timestamp: string = new Date().toISOString(),
  ): ApiErrorResponse {
    return {
      status: ApiStatus.FAILED,
      message,
      statusCode,
      errorCode,
      timestamp,
      path,
    };
  }
}