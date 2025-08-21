# Development Workflow & Guidelines

## 🚀 Overview

Panduan ini menjelaskan workflow pengembangan yang disarankan untuk project NestJS Starter MVP ini, beserta coding standards dan best practices.

## 📋 Development Workflow

### 1. **Setup Development Environment**

```bash
# Clone repository
git clone <repository-url>
cd broy-nestjs-starter-mvp

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env file dengan konfigurasi yang sesuai

# Setup database
npm run db:migrate
npm run db:seed

# Start development server
npm run start:dev
```

### 2. **Feature Development Process**

#### A. Planning Phase
1. Buat issue di GitHub dengan template yang sesuai
2. Diskusikan requirement dan design
3. Tentukan acceptance criteria

#### B. Development Phase
```bash
# Create feature branch from main
git checkout -b feature/user-management

# Develop with incremental commits
git add .
git commit -m "feat: add user creation endpoint"

# Regular sync with main
git fetch origin
git rebase origin/main
```

#### C. Code Review Phase
1. Create Pull Request dengan template yang lengkap
2. Ensure all tests pass
3. Request review from team members
4. Address review comments

#### D. Deployment Phase
```bash
# Merge to main after approval
git checkout main
git merge feature/user-management

# Deploy to staging
npm run deploy:staging

# After testing, deploy to production
npm run deploy:production
```

## 🏗️ Module Development Workflow

### 1. **Create New Module**

```bash
# Generate module structure
nest generate module modules/product
nest generate controller modules/product
nest generate service modules/product

# Or use custom script (if available)
./scripts/generate-module.sh product
```

### 2. **Module Development Steps**

#### Step 1: Define DTOs
```typescript
// dto/create-product.dto.ts
export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;
}
```

#### Step 2: Create Service
```typescript
// product.service.ts
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

#### Step 3: Implement Controller
```typescript
// product.controller.ts
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }
}
```

#### Step 4: Configure Module
```typescript
// product.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
```

#### Step 5: Add Tests
```typescript
// product.controller.spec.ts
describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: createMockProductService(),
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should create product', async () => {
    const createDto = MockProductFactory.createDto();
    const expectedProduct = MockProductFactory.create();

    jest.spyOn(service, 'create').mockResolvedValue(expectedProduct);

    const result = await controller.create(createDto);

    expect(result).toEqual(expectedProduct);
    expect(service.create).toHaveBeenCalledWith(createDto);
  });
});
```

### 3. **Database Schema Updates**

```bash
# Edit schema.prisma
# Add new model

# Generate and run migration
npx prisma migrate dev --name add-product-table

# Update seed file if needed
# Edit prisma/seed.ts

# Run seed
npm run db:seed
```

## 📏 Coding Standards

### 1. **File Naming Conventions**

```
├── kebab-case.dto.ts           # DTOs
├── kebab-case.entity.ts        # Entities
├── kebab-case.interface.ts     # Interfaces
├── kebab-case.service.ts       # Services
├── kebab-case.controller.ts    # Controllers
├── kebab-case.module.ts        # Modules
├── kebab-case.guard.ts         # Guards
├── kebab-case.interceptor.ts   # Interceptors
├── kebab-case.filter.ts        # Filters
└── kebab-case.spec.ts          # Tests
```

### 2. **Code Formatting**

```bash
# Format code before commit
npm run format

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
```

### 3. **Import Organization**

```typescript
// 1. Node modules
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/client';

// 2. Internal imports (absolute paths)
import { BaseService } from 'src/common/services/base.service';
import { ApiResponse } from 'src/common/interfaces';

// 3. Relative imports
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
```

### 4. **Error Handling**

```typescript
// Service layer
async createProduct(createProductDto: CreateProductDto): Promise<ApiResponse<Product>> {
  try {
    const existingProduct = await this.findByName(createProductDto.name);
    if (existingProduct) {
      throw new ConflictException('Product with this name already exists');
    }

    const product = await this.model.create({ data: createProductDto });
    
    return ResponseHelper.success(product, 'Product created successfully');
  } catch (error) {
    this.logger.error(`Error creating product: ${error.message}`);
    
    if (error instanceof ConflictException) {
      throw error;
    }
    
    throw new InternalServerErrorException('Failed to create product');
  }
}
```

### 5. **Validation Patterns**

```typescript
// DTO validation
export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: 'Latest iPhone model', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999.99)
  price: number;

  @ApiProperty({ example: 'ELECTRONICS' })
  @IsEnum(ProductCategory)
  category: ProductCategory;
}
```

## 🧪 Testing Guidelines

### 1. **Test Structure**

```
src/
├── module/
│   ├── __tests__/           # Module-specific tests
│   │   ├── unit/
│   │   └── integration/
│   ├── module.controller.spec.ts
│   └── module.service.spec.ts
└── common/
    └── testing/
        ├── mock-factories.ts
        ├── test-helpers.ts
        └── test-setup.ts
```

### 2. **Unit Test Example**

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

    service = module.get<ProductService>(ProductService);
    prisma = module.get<MockPrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      // Arrange
      const createDto = MockProductFactory.createDto();
      const expectedProduct = MockProductFactory.create();
      prisma.product.create.mockResolvedValue(expectedProduct);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result.status).toBe(ApiStatus.SUCCESS);
      expect(result.data).toEqual(expectedProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if product name exists', async () => {
      // Arrange
      const createDto = MockProductFactory.createDto();
      const existingProduct = MockProductFactory.create();
      prisma.product.findFirst.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException
      );
    });
  });
});
```

### 3. **Integration Test Example**

```typescript
describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
    
    // Setup auth token
    authToken = await TestHelper.getAuthToken(app);
  });

  afterEach(async () => {
    await TestHelper.cleanupDatabase(prisma);
  });

  it('/products (POST) should create product', async () => {
    const createDto = MockProductFactory.createDto();

    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe('success');
        expect(res.body.data.name).toBe(createDto.name);
      });
  });
});
```

## 🚀 Performance Guidelines

### 1. **Database Optimization**

```typescript
// Use indexes for frequently queried fields
model Product {
  id          String   @id @default(cuid())
  name        String   @unique
  category    String   @index
  price       Float    @index
  createdAt   DateTime @default(now()) @index
}

// Implement pagination
async findMany(query: GetProductsDto) {
  const { skip, take } = PaginationHelper.paginate(query);
  
  return this.model.findMany({
    skip,
    take,
    select: {
      id: true,
      name: true,
      price: true,
      // Don't select large fields like description
    },
    where: this.buildWhereClause(query),
  });
}
```

### 2. **Caching Strategy**

```typescript
async findById(id: string): Promise<Product | null> {
  const cacheKey = `product:${id}`;
  
  // Try cache first
  const cached = await this.cacheService.get<Product>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Query database
  const product = await this.model.findUnique({ where: { id } });
  
  if (product) {
    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, product, 300);
  }
  
  return product;
}
```

### 3. **API Response Optimization**

```typescript
// Use DTOs to control response shape
export class ProductListResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  thumbnail?: string;

  // Don't include large fields like full description
}

// Transform data in service
async findMany(query: GetProductsDto): Promise<ApiResponse<ProductListResponseDto[]>> {
  const products = await this.model.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      images: { take: 1, select: { url: true } },
    },
  });

  const transformed = products.map(product => ({
    ...product,
    thumbnail: product.images[0]?.url,
  }));

  return ResponseHelper.success(transformed);
}
```

## 📦 Deployment Workflow

### 1. **Environment Configuration**

```bash
# Development
NODE_ENV=development
LOG_LEVEL=debug

# Staging
NODE_ENV=staging
LOG_LEVEL=info

# Production
NODE_ENV=production
LOG_LEVEL=error
```

### 2. **Build Process**

```bash
# Production build
npm run build

# Run tests
npm run test
npm run test:e2e

# Database migration (production)
npm run db:migrate:prod

# Start production server
npm run start:prod
```

### 3. **Health Checks**

```typescript
// health.controller.ts
@Get()
async check() {
  return this.health.check([
    () => this.db.pingCheck('database'),
    () => this.redis.pingCheck('redis'),
    () => this.disk.checkStorage('storage', { threshold: 250 * 1024 * 1024 * 1024 }),
  ]);
}
```

## 🔐 Security Guidelines

### 1. **Input Validation**

```typescript
// Always validate and sanitize input
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Matches(/^[a-zA-Z0-9\s\-_.]+$/, {
    message: 'Name contains invalid characters',
  })
  name: string;
}
```

### 2. **Authentication & Authorization**

```typescript
// Protect sensitive endpoints
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminProductController {
  // Admin-only endpoints
}
```

### 3. **File Upload Security**

```typescript
// Validate file types and sizes
@Post('upload')
@UseInterceptors(
  FileInterceptor('file', {
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed'), false);
      }
      callback(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  })
)
uploadImage(@UploadedFile() file: Express.Multer.File) {
  return this.fileService.uploadImage(file);
}
```

## 📊 Monitoring & Logging

### 1. **Logging Standards**

```typescript
@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  async create(createProductDto: CreateProductDto) {
    this.logger.log(`Creating product: ${createProductDto.name}`);
    
    try {
      const product = await this.model.create({ data: createProductDto });
      this.logger.log(`Product created successfully: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`);
      throw error;
    }
  }
}
```

### 2. **Metrics Collection**

```typescript
// Add metrics for monitoring
@Injectable()
export class MetricsService {
  private readonly productCreated = new Counter({
    name: 'products_created_total',
    help: 'Total number of products created',
  });

  recordProductCreated() {
    this.productCreated.inc();
  }
}
```

Workflow ini memastikan:
- **Konsistensi** dalam development process
- **Kualitas kode** yang tinggi
- **Maintainability** jangka panjang
- **Security** dan **Performance** yang optimal
