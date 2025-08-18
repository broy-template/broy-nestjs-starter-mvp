// JWT Payload interface
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

// Export new response system
export * from '../response/api-response';
export * from '../response/response.decorator';
