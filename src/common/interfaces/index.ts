export interface ApiResponse<T = any> {
  status: 'success' | 'failed';
  message: string;
  data?: T;
  pagination?: PaginationInfo;
  statusCode?: number;
  errorCode?: string;
  timestamp?: string;
  path?: string;
}

export interface PaginationInfo {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
}

export interface JwtPayload {
  email: string;
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}
