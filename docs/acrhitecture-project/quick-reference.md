# Quick Reference Guide

## 🚀 Cheat Sheet untuk Development

### 📁 Project Structure Overview

```
broy-nestjs-starter-mvp/
├── 📁 src/
│   ├── 📁 common/           # Shared utilities (guards, interceptors, etc.)
│   ├── 📁 config/           # App configuration
│   ├── 📁 files/            # File management module
│   ├── 📁 modules/          # Feature modules (auth, user, health)
│   ├── 📄 app.module.ts     # Root module
│   └── 📄 main.ts           # App entry point
├── 📁 prisma/               # Database schema & migrations
├── 📁 docs/                 # Documentation
├── 📁 scripts/              # Setup scripts
└── 📄 package.json          # Dependencies & scripts
```

### 🛠️ Essential Commands

```bash
# Development
npm run start:dev          # Start dev server with hot reload
npm run start:debug        # Start with debugging enabled

# Database
npm run db:migrate         # Run database migrations
npm run db:seed            # Seed database with test data
npm run db:studio          # Open Prisma Studio
npm run db:reset           # Reset database (dev only)

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Code Quality
npm run lint               # Check code style
npm run lint:fix           # Fix lint issues
npm run format             # Format code with Prettier

# Build & Deploy
npm run build              # Build for production
npm run start:prod         # Start production server
```

### 🎯 Common Development Tasks

#### Create New Module
```bash
# Generate module files
nest g module modules/product
nest g controller modules/product
nest g service modules/product

# Or manually create:
modules/product/
├── dto/
├── product.controller.ts
├── product.service.ts
└── product.module.ts
```

#### Add New Endpoint
```typescript
@Controller('products')
export class ProductController {
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create product' })
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }
}
```

#### Create DTO with Validation
```typescript
export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;
}
```

#### Add Database Model
```prisma
// prisma/schema.prisma
model Product {
  id        String   @id @default(cuid())
  name      String   @unique
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 🔐 Authentication & Authorization

#### Protect Endpoint
```typescript
@UseGuards(JwtAuthGuard)    // Require authentication
@Roles(Role.ADMIN)          // Require specific role
@Public()                   // Make endpoint public
```

#### Get Current User
```typescript
@Get('profile')
async getProfile(@CurrentUser() user: UserPayload) {
  return this.userService.findById(user.id);
}
```

### 📦 Common Imports

```typescript
// NestJS Core
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

// Validation
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

// Common utilities
import { Public, Roles, CurrentUser } from 'src/common';
import { JwtAuthGuard, RolesGuard } from 'src/common/guards';
import { ApiResponse, ApiStatus } from 'src/common/interfaces';
```

### 🎨 Code Patterns

#### Service Pattern
```typescript
@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  protected get model() {
    return this.prisma.product;
  }

  async findByName(name: string): Promise<Product | null> {
    return this.model.findFirst({ where: { name } });
  }
}
```

#### Controller Pattern
```typescript
@Controller('products')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseTransformInterceptor)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@Query() query: GetProductsDto) {
    return this.productService.findMany(query);
  }
}
```

#### Response Pattern
```typescript
// Service returns standardized response
return {
  status: ApiStatus.SUCCESS,
  message: 'Products retrieved successfully',
  data: products,
  pagination: paginationInfo, // optional
};
```

### 🧪 Testing Patterns

#### Unit Test
```typescript
describe('ProductService', () => {
  let service: ProductService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useClass: MockPrismaService },
      ],
    }).compile();

    service = module.get(ProductService);
    prisma = module.get(PrismaService);
  });

  it('should create product', async () => {
    const dto = MockProductFactory.createDto();
    const expected = MockProductFactory.create();
    
    prisma.product.create.mockResolvedValue(expected);
    
    const result = await service.create(dto);
    
    expect(result.data).toEqual(expected);
  });
});
```

#### E2E Test
```typescript
describe('ProductController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/products (POST)', async () => {
    return request(app.getHttpServer())
      .post('/products')
      .send(createProductDto)
      .expect(201);
  });
});
```

### 🔧 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis (optional)
REDIS_HOST="localhost"
REDIS_PORT=6379

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 📊 Database Operations

#### Query with Pagination
```typescript
async findMany(query: GetProductsDto) {
  const { skip, take } = PaginationHelper.paginate(query);
  
  const [products, total] = await Promise.all([
    this.model.findMany({
      skip,
      take,
      where: this.buildWhereClause(query),
    }),
    this.model.count({ where: this.buildWhereClause(query) }),
  ]);

  const pagination = PaginationHelper.createPaginationInfo(
    total, query.page, query.limit
  );

  return { products, pagination };
}
```

#### Relationships
```prisma
model User {
  id       String    @id @default(cuid())
  posts    Post[]    // One-to-many
  profile  Profile?  // One-to-one
}

model Post {
  id       String @id @default(cuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}
```

### 🚀 Deployment Checklist

#### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Build successful
- [ ] Health checks working

#### Production
```bash
# Build application
npm run build

# Run migrations
npm run db:migrate:prod

# Start application
npm run start:prod
```

### 🔍 Debugging Tips

#### Enable Debug Logging
```bash
npm run start:debug
# Or set LOG_LEVEL=debug in .env
```

#### Database Query Logging
```typescript
// In prisma.service.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

#### API Testing
```bash
# Health check
curl http://localhost:3000/api/v1/health

# Get auth token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Use token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/users
```

### 📚 Documentation Links

- [Project Structure](./project-structure.md)
- [Module Architecture](./module-architecture.md)
- [Common Architecture](./common-architecture.md)
- [Development Workflow](./development-workflow.md)

### 🆘 Common Issues & Solutions

#### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
PORT=3001 npm run start:dev
```

#### Database Connection Issues
```bash
# Check database is running
npm run db:studio

# Reset database
npm run db:reset
```

#### Module Import Errors
```typescript
// Always use absolute imports for src/
import { UserService } from 'src/modules/user/user.service';

// Use relative imports for same module
import { CreateUserDto } from './dto/create-user.dto';
```

---

**💡 Tip**: Bookmark halaman ini untuk referensi cepat saat development!
