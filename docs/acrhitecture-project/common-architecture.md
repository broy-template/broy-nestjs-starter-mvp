# Common Utilities Documentation

## 📚 Overview

Folder `src/common/` berisi komponen-komponen yang dapat digunakan di seluruh aplikasi. Ini mengikuti prinsip DRY (Don't Repeat Yourself) dan memastikan konsistensi dalam seluruh codebase.

## 🎨 Decorators

### Authentication & Authorization
- **`@Public()`**: Menandai endpoint sebagai publik (tidak memerlukan autentikasi)
- **`@Roles(role1, role2)`**: Menentukan role yang diizinkan mengakses endpoint
- **`@CurrentUser()`**: Mengekstrak informasi user dari request

### Response Handling
- **`@SkipResponseTransform()`**: Melewati response transformation (untuk file download, dll)
- **`@ApiResponseWrapper()`**: Custom response format untuk Swagger

### Validation
- **`@IsNotEmptyString()`**: Validasi string tidak kosong
- **`@IsValidEmail()`**: Validasi format email

## 📦 Data Transfer Objects (DTOs)

### Query DTOs
```typescript
// common/dto/query.dto.ts
export class PaginationDto {
  page?: number = 1;
  limit?: number = 10;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class SearchDto extends PaginationDto {
  search?: string;
  filters?: Record<string, any>;
}
```

### User DTOs
```typescript
// common/dto/user.dto.ts
export class BaseUserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
}
```

## 🛡️ Guards

### JWT Authentication Guard
```typescript
// common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()]
    );
    
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

### Roles Guard
```typescript
// common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

## 🔄 Interceptors

### Response Transform Interceptor
Menstandarkan format response API:
```typescript
{
  "status": "success" | "failed",
  "message": "string",
  "data": any,
  "pagination": PaginationInfo // optional
}
```

### Logging Interceptor
Mencatat semua request dan response untuk debugging.

### Watermark Interceptor
Menambahkan metadata seperti timestamp, request ID, dll.

## 🚫 Exception Filters

### All Exceptions Filter
```typescript
// common/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      status: ApiStatus.FAILED,
      message: this.getErrorMessage(exception),
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
```

## 🔧 Services

### Base Service
Menyediakan operasi CRUD dasar:
```typescript
// common/services/base.service.ts
export abstract class BaseService<T> {
  constructor(protected prisma: PrismaService) {}

  async findMany(args?: any): Promise<T[]> {
    return this.model.findMany(args);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  protected abstract get model(): any;
}
```

### Cache Service
Wrapper untuk Redis operations:
```typescript
// common/services/cache.service.ts
@Injectable()
export class CacheService {
  async get<T>(key: string): Promise<T | null> { }
  async set(key: string, value: any, ttl?: number): Promise<void> { }
  async del(key: string): Promise<void> { }
  async flush(): Promise<void> { }
}
```

### Email Service
Mengirim email menggunakan template:
```typescript
// common/services/email.service.ts
@Injectable()
export class EmailService {
  async sendWelcomeEmail(user: User): Promise<void> { }
  async sendPasswordResetEmail(user: User, token: string): Promise<void> { }
  async sendVerificationEmail(user: User, token: string): Promise<void> { }
}
```

### Time Service
Utilitas untuk manipulasi waktu:
```typescript
// common/services/time.service.ts
@Injectable()
export class TimeService {
  now(): Date { }
  addDays(date: Date, days: number): Date { }
  formatDate(date: Date, format: string): string { }
  isExpired(date: Date): boolean { }
  getDiffInMinutes(start: Date, end: Date): number { }
}
```

## 🔧 Helpers

### Pagination Helper
```typescript
// common/helpers/pagination.helper.ts
export class PaginationHelper {
  static paginate(query: PaginationDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    return { skip, take: limit };
  }

  static createPaginationInfo(
    totalItems: number,
    currentPage: number,
    itemsPerPage: number
  ): PaginationInfo {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return {
      totalItems,
      itemsPerPage,
      currentPage,
      totalPages,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
    };
  }
}
```

### Response Helper
```typescript
// common/helpers/response.helper.ts
export class ResponseHelper {
  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      status: ApiStatus.SUCCESS,
      message,
      data,
    };
  }

  static successWithPagination<T>(
    data: T[],
    pagination: PaginationInfo,
    message = 'Success'
  ): ApiResponse<T[]> {
    return {
      status: ApiStatus.SUCCESS,
      message,
      data,
      pagination,
    };
  }
}
```

### Validation Helper
```typescript
// common/helpers/validation.helper.ts
export class ValidationHelper {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isStrongPassword(password: string): boolean {
    // Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }
}
```

## 📡 Interfaces

### API Response Interface
```typescript
// common/interfaces/api-response.ts
export enum ApiStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface ApiResponse<T = any> {
  status: ApiStatus;
  message: string;
  data?: T;
  pagination?: PaginationInfo;
}

export interface ApiErrorResponse {
  status: ApiStatus.FAILED;
  message: string;
  statusCode: number;
  errorCode?: string;
  timestamp: string;
  path: string;
}
```

### User Payload Interface
```typescript
// common/interfaces/user-payload.ts
export interface UserPayload {
  id: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
```

## 🧪 Testing Utilities

### Mock Factories
```typescript
// common/testing/mock-factories.ts
export class MockUserFactory {
  static create(overrides?: Partial<User>): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: Role.USER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
```

### Test Helpers
```typescript
// common/testing/test-helpers.ts
export class TestHelper {
  static async createTestUser(prisma: PrismaService): Promise<User> {
    return prisma.user.create({
      data: MockUserFactory.create(),
    });
  }

  static async cleanupDatabase(prisma: PrismaService): Promise<void> {
    await prisma.user.deleteMany();
    // Delete other entities...
  }
}
```

## 🎯 Usage Examples

### Controller dengan Common Utilities
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  @Get()
  @Roles(Role.ADMIN)
  async getUsers(@Query() query: PaginationDto) {
    const { skip, take } = PaginationHelper.paginate(query);
    const users = await this.userService.findMany({ skip, take });
    const total = await this.userService.count();
    
    const pagination = PaginationHelper.createPaginationInfo(
      total, query.page, query.limit
    );
    
    return ResponseHelper.successWithPagination(users, pagination);
  }

  @Post()
  @Public()
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return ResponseHelper.success(user, 'User created successfully');
  }
}
```

### Service dengan Base Service
```typescript
@Injectable()
export class UserService extends BaseService<User> {
  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({ where: { email } });
  }
}
```

## 🚀 Best Practices

1. **Gunakan Base Service** untuk operasi CRUD standar
2. **Implementasikan proper error handling** dengan exception filters
3. **Standardize response format** dengan response helpers
4. **Gunakan decorators** untuk cross-cutting concerns
5. **Leverage caching** untuk performance optimization
6. **Write comprehensive tests** menggunakan testing utilities

Struktur `common/` ini memastikan konsistensi, reusability, dan maintainability di seluruh aplikasi.
