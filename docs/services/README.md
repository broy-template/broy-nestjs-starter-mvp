# Services Documentation

## Overview

Dokumentasi untuk semua service yang tersedia di Broy NestJS Starter MVP. Services ini dirancang untuk mempercepat development dengan menyediakan utilities yang umum dibutuhkan.

## Available Services

### 🕰️ **Time Service**
**File:** `src/common/services/time.service.ts`  
**Documentation:** [Time Service Guide](./services/time-service.md)

Service untuk handling waktu dengan dukungan mocking untuk testing.

**Key Features:**
- Abstraksi waktu untuk testing
- Date manipulation utilities
- Timezone support
- Mock time untuk unit testing

**Quick Usage:**
```typescript
// Get current time (mockable)
const now = this.timeService.now();

// Add/subtract time
const tomorrow = this.timeService.addDays(now, 1);
const oneHourAgo = this.timeService.subtractHours(now, 1);

// Testing
timeService.setMockTime(new Date('2023-01-15T10:00:00Z'));
```

### 🗄️ **Cache Service**
**File:** `src/common/services/cache.service.ts`  
**Documentation:** [Cache Service Guide](./services/cache-service.md)

In-memory caching service dengan dukungan TTL dan cache patterns.

**Key Features:**
- In-memory caching dengan TTL
- Cache-aside pattern (remember)
- User-specific cache helpers
- Easy Redis migration path

**Quick Usage:**
```typescript
// Basic caching
await this.cacheService.set('user:123', userData, 3600); // 1 hour TTL
const user = await this.cacheService.get<User>('user:123');

// Cache-aside pattern
const userData = await this.cacheService.remember(
  'user:123',
  3600,
  async () => await this.userRepository.findById(123)
);
```

### 📧 **Email Service**
**File:** `src/common/services/email.service.ts`  
**Documentation:** [Email Service Guide](./services/email-service.md)

Service untuk pengiriman email dengan dukungan multiple providers.

**Key Features:**
- Multi-provider support (SendGrid, SMTP, Mock)
- Template-based emails
- Development-friendly dengan MailHog
- Common email patterns (welcome, reset password)

**Quick Usage:**
```typescript
// Send basic email
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our platform!</h1>'
});

// Send template emails
await this.emailService.sendWelcomeEmail('user@example.com', 'John Doe');
await this.emailService.sendPasswordResetEmail('user@example.com', 'reset-token');
```

### 📁 **File Upload Service**
**File:** `src/common/services/file-upload.service.ts`

Service untuk handling file upload dengan validation dan storage management.

**Key Features:**
- File validation (size, type)
- Secure filename generation
- Multiple storage options (local, S3-ready)
- File management utilities

**Quick Usage:**
```typescript
// Upload file
const result = await this.fileUploadService.uploadFile(file);
console.log(result.url); // File URL

// Delete file
await this.fileUploadService.deleteFile(filename);
```

### 🏗️ **Base Service**
**File:** `src/common/services/base.service.ts`

Base class untuk service lain dengan common patterns dan utilities.

**Key Features:**
- Common service patterns
- Error handling utilities
- Database operation helpers
- Logging integration

## Service Integration Patterns

### 1. Service Injection

```typescript
@Injectable()
export class YourService {
  constructor(
    private timeService: TimeService,
    private cacheService: CacheService,
    private emailService: EmailService,
    private fileUploadService: FileUploadService,
  ) {}
}
```

### 2. Service Combination Example

```typescript
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private emailService: EmailService,
    private timeService: TimeService,
  ) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        createdAt: this.timeService.now(), // Use time service
      }
    });

    // Cache user data
    await this.cacheService.set(`user:${user.id}`, user, 3600);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return user;
  }
}
```

### 3. Testing with Services

```typescript
describe('UserService', () => {
  let userService: UserService;
  let timeService: TimeService;
  let cacheService: CacheService;

  beforeEach(async () => {
    // Setup test module...
  });

  afterEach(() => {
    timeService.clearMockTime();
  });

  it('should create user with correct timestamp', async () => {
    // Mock time for consistent testing
    const mockTime = new Date('2023-01-15T10:00:00Z');
    timeService.setMockTime(mockTime);

    const user = await userService.createUser(userData);
    
    expect(user.createdAt).toEqual(mockTime);
  });
});
```

## Development Workflow

### 1. Adding New Service

1. Create service file in `src/common/services/`
2. Add to `src/common/services/index.ts`
3. Add to `src/common/index.ts`
4. Write tests
5. Add documentation to `docs/services/`

### 2. Service Dependencies

Services dapat menggunakan service lain:

```typescript
@Injectable()
export class EmailService {
  constructor(
    private timeService: TimeService, // Use time for scheduling
    private cacheService: CacheService, // Cache email templates
  ) {}
}
```

### 3. Environment Configuration

Services menggunakan ConfigService untuk configuration:

```typescript
@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    this.provider = this.configService.get('email.provider');
    this.fromEmail = this.configService.get('email.fromEmail');
  }
}
```

## Best Practices

### 1. Service Responsibility
- Setiap service punya tanggung jawab yang jelas
- Tidak menggabungkan multiple concerns dalam satu service
- Use composition over inheritance

### 2. Error Handling
- Graceful error handling dalam services
- Log errors dengan proper context
- Return meaningful error messages

### 3. Testing
- Mock external dependencies
- Test edge cases dan error scenarios
- Use time service untuk time-dependent tests

### 4. Performance
- Use caching untuk expensive operations
- Implement proper TTL strategies
- Monitor service performance

## Service Module Registration

Untuk menggunakan services, daftarkan di module:

```typescript
@Module({
  providers: [
    TimeService,
    CacheService,
    EmailService,
    FileUploadService,
    // Your services
  ],
  exports: [
    TimeService,
    CacheService,
    EmailService,
    FileUploadService,
  ],
})
export class CommonModule {}
```

Kemudian import di module yang membutuhkan:

```typescript
@Module({
  imports: [CommonModule],
  // ...
})
export class YourModule {}
```

## Migration Notes

Jika ingin migrate ke provider external:

### Cache → Redis
```typescript
// Replace in-memory cache with Redis
@Injectable()
export class RedisCacheService extends CacheService {
  // Implementation with Redis
}
```

### Email → SendGrid/SES
```typescript
// Update EmailService implementation
// No code changes needed in consuming services
```

Services ini memberikan foundation yang solid untuk development MVP yang cepat dan scalable! 🚀
