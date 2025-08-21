# Module Architecture & Best Practices

## 📋 Overview

Dokumentasi ini menjelaskan arsitektur module dalam project NestJS Starter MVP dan best practices untuk pengembangan yang konsisten.

## 🏗️ Module Structure Pattern

Setiap module mengikuti struktur standar berikut:

```
module-name/
├── 📁 dto/                    # Data Transfer Objects
│   ├── 📄 create-entity.dto.ts
│   ├── 📄 update-entity.dto.ts
│   ├── 📄 query-entity.dto.ts
│   └── 📄 response-entity.dto.ts
├── 📁 entities/               # Database entities (optional)
│   └── 📄 entity.entity.ts
├── 📁 interfaces/             # TypeScript interfaces (optional)
│   └── 📄 entity.interface.ts
├── 📄 module-name.controller.ts
├── 📄 module-name.service.ts
├── 📄 module-name.module.ts
└── 📄 module-name.controller.spec.ts
```

## 🔐 Auth Module

### Structure
```
auth/
├── 📁 dto/
│   ├── 📄 login.dto.ts           # Login credentials
│   ├── 📄 register.dto.ts        # Registration data
│   ├── 📄 refresh-token.dto.ts   # Refresh token request
│   └── 📄 auth-response.dto.ts   # Authentication response
├── 📁 strategies/
│   ├── 📄 jwt.strategy.ts        # JWT authentication strategy
│   └── 📄 local.strategy.ts      # Local authentication strategy
├── 📄 auth.controller.ts
├── 📄 auth.service.ts
└── 📄 auth.module.ts
```

### Key Features
- **JWT Authentication**: Token-based authentication
- **Refresh Tokens**: Secure token renewal
- **Password Hashing**: Bcrypt for password security
- **Role-based Access**: Integration with guards

### Endpoints
```typescript
POST /auth/register     # User registration
POST /auth/login        # User login
POST /auth/refresh      # Refresh access token
POST /auth/logout       # User logout
GET  /auth/profile      # Get current user profile
```

## 👤 User Module

### Structure
```
user/
├── 📁 dto/
│   ├── 📄 create-user.dto.ts     # Create user data
│   ├── 📄 update-user.dto.ts     # Update user data
│   ├── 📄 get-users.dto.ts       # Query parameters
│   └── 📄 update-avatar.dto.ts   # Avatar update data
├── 📄 user.controller.ts
├── 📄 user.service.ts
└── 📄 user.module.ts
```

### Key Features
- **CRUD Operations**: Complete user management
- **Avatar Management**: File upload integration
- **User Search**: Pagination and filtering
- **Role Management**: Admin capabilities

### Endpoints
```typescript
GET    /users           # List users (with pagination)
GET    /users/:id       # Get specific user
POST   /users           # Create new user
PATCH  /users/:id       # Update user
DELETE /users/:id       # Delete user
POST   /users/:id/avatar # Upload user avatar
```

## 📁 Files Module

### Structure
```
files/
├── 📁 dto/
│   ├── 📄 file-upload.dto.ts     # File upload DTOs
│   └── 📄 file-response.dto.ts   # File response DTOs
├── 📄 files.controller.ts
├── 📄 files.service.ts
└── 📄 files.module.ts
```

### Key Features
- **File Upload**: Secure file upload with validation
- **File Download**: Stream-based file delivery
- **File Management**: List, delete files
- **Security**: Path traversal protection

### Endpoints
```typescript
POST   /files/upload           # Upload file
GET    /files/download/:filename # Download file
GET    /files/list             # List uploaded files
DELETE /files/delete/:filename # Delete file
```

## 🏥 Health Module

### Structure
```
health/
├── 📄 health.controller.ts
└── 📄 health.module.ts
```

### Key Features
- **Database Health**: Check database connectivity
- **Redis Health**: Check cache connectivity
- **Memory Usage**: Monitor system resources
- **Disk Space**: Check available storage

### Endpoints
```typescript
GET /health        # Overall system health
GET /health/db     # Database health check
GET /health/redis  # Redis health check
```

## 🎯 Module Development Best Practices

### 1. Controller Best Practices

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseTransformInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async getUsers(@Query() query: GetUsersDto) {
    return this.userService.findMany(query);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
```

**Key Points:**
- Use decorators consistently
- Implement proper validation with DTOs
- Add Swagger documentation
- Apply appropriate guards and interceptors

### 2. Service Best Practices

```typescript
@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
  ) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.user;
  }

  async findMany(query: GetUsersDto): Promise<ApiResponse<User[]>> {
    const { skip, take } = PaginationHelper.paginate(query);
    
    // Try cache first
    const cacheKey = `users:${JSON.stringify(query)}`;
    const cached = await this.cacheService.get<User[]>(cacheKey);
    if (cached) {
      return ResponseHelper.success(cached, 'Users retrieved from cache');
    }

    // Database query
    const users = await this.model.findMany({
      skip,
      take,
      where: this.buildWhereClause(query),
      orderBy: { [query.sortBy]: query.sortOrder },
    });

    // Cache results
    await this.cacheService.set(cacheKey, users, 300); // 5 minutes

    const total = await this.model.count();
    const pagination = PaginationHelper.createPaginationInfo(
      total, query.page, query.limit
    );

    return {
      status: ApiStatus.SUCCESS,
      message: 'Users retrieved successfully',
      data: users,
      pagination,
    };
  }

  private buildWhereClause(query: GetUsersDto) {
    const where: any = {};
    
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    
    if (query.role) {
      where.role = query.role;
    }
    
    if (query.status) {
      where.status = query.status;
    }
    
    return where;
  }
}
```

**Key Points:**
- Extend BaseService for common operations
- Implement caching where appropriate
- Use proper error handling
- Build dynamic queries safely
- Return standardized responses

### 3. DTO Best Practices

```typescript
// Create DTO
export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @ApiProperty({ enum: Role, default: Role.USER })
  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.USER;
}

// Update DTO
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'])
) {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsOptional()
  @Length(2, 50)
  name?: string;

  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}

// Query DTO
export class GetUsersDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';
}

// Response DTO
export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  avatar?: string;
}
```

**Key Points:**
- Use class-validator for validation
- Add Swagger documentation
- Extend/omit DTOs to avoid duplication
- Provide sensible defaults
- Use enums for restricted values

### 4. Module Configuration

```typescript
@Module({
  imports: [
    PrismaModule,
    CacheModule,
    EmailModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
```

**Key Points:**
- Import necessary modules
- Export services that other modules might need
- Configure global guards at module level
- Keep module focused on single responsibility

## 🔄 Inter-Module Communication

### Service Injection
```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService, // From UserModule
    private readonly emailService: EmailService, // From Common
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<ApiResponse<User>> {
    // Create user via UserService
    const user = await this.userService.create(registerDto);
    
    // Send welcome email
    await this.emailService.sendWelcomeEmail(user);
    
    return ResponseHelper.success(user, 'User registered successfully');
  }
}
```

### Event-Driven Communication
```typescript
// User service emits events
export class UserService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.model.create({ data: createUserDto });
    
    // Emit event for other services to handle
    this.eventEmitter.emit('user.created', user);
    
    return user;
  }
}

// Auth service listens to events
@Injectable()
export class AuthService {
  @OnEvent('user.created')
  async handleUserCreated(user: User) {
    await this.emailService.sendWelcomeEmail(user);
  }
}
```

## 📊 Testing Strategy

### Unit Tests
```typescript
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a user', async () => {
    const createUserDto = MockUserFactory.createDto();
    const expectedUser = MockUserFactory.create();

    jest.spyOn(prisma.user, 'create').mockResolvedValue(expectedUser);

    const result = await service.create(createUserDto);

    expect(result.data).toEqual(expectedUser);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: createUserDto,
    });
  });
});
```

### Integration Tests
```typescript
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  it('/users (POST)', async () => {
    const createUserDto = MockUserFactory.createDto();

    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.data.email).toBe(createUserDto.email);
        expect(res.body.status).toBe('success');
      });
  });
});
```

## 🚀 Deployment Considerations

### Environment Configuration
```typescript
// Each module can have its own config
@Injectable()
export class UserConfig {
  @IsNumber()
  @Min(1)
  @Max(100)
  maxUsersPerPage = parseInt(process.env.MAX_USERS_PER_PAGE || '20');

  @IsBoolean()
  enableUserRegistration = process.env.ENABLE_USER_REGISTRATION === 'true';

  @IsString()
  @IsNotEmpty()
  defaultUserRole = process.env.DEFAULT_USER_ROLE || 'USER';
}
```

### Production Optimizations
- Enable caching for frequently accessed data
- Implement rate limiting per module
- Use database indexes for query optimization
- Monitor performance metrics per module

Arsitektur module ini memastikan:
- **Scalability**: Mudah menambah fitur baru
- **Maintainability**: Kode terorganisir dengan baik
- **Testability**: Setiap komponen dapat ditest secara isolasi
- **Reusability**: Service dapat digunakan di module lain
