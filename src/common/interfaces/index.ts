import type { Role } from '@prisma/client';
import { UserPayload } from '../entities/user-payload.entity';

// JWT Payload interface
export interface JwtPayload {
  email: string;
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}



export interface RequestWithUser extends Request {
  user: UserPayload;
}

// Export new response system
export * from '../response/api-response';
export * from '../response/response.decorator';
