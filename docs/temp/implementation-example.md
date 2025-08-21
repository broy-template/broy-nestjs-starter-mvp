# Contoh Implementasi dengan Common Utilities

## Contoh: Product Module

### 1. DTO Query
```typescript
// src/modules/product/dto/get-products.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumberString } from 'class-validator';
import { BaseQueryDto } from '../../../common/dto/query.dto';

enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  BOOKS = 'BOOKS'
}

export class GetProductsDto extends BaseQueryDto {
  @ApiProperty({
    description: 'Filter berdasarkan kategori',
    enum: ProductCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductCategory, { message: 'Kategori tidak valid' })
  category?: ProductCategory;

  @ApiProperty({
    description: 'Harga minimum',
    example: '10000',
    required: false,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Harga minimum harus berupa angka' })
  minPrice?: string;

  @ApiProperty({
    description: 'Harga maksimum',
    example: '100000',
    required: false,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Harga maksimum harus berupa angka' })
  maxPrice?: string;
}
```

### 2. Service dengan BaseService
```typescript
// src/modules/product/product.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { PrismaService } from '../../common/prisma.service';
import { SuccessResponse } from '../../common/interfaces';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { ProductRO } from './ro/product.ro';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma, ProductService.name);
  }

  async create(createProductDto: CreateProductDto) {
    // Cek duplikasi berdasarkan nama
    const existingProduct = await this.prisma.product.findFirst({
      where: { name: createProductDto.name }
    });

    if (existingProduct) {
      throw new ConflictException('Nama produk sudah ada');
    }

    const product = await this.prisma.product.create({
      data: createProductDto,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    this.logOperation('Membuat produk', product.name);

    const productRO = plainToInstance(ProductRO, product);
    return SuccessResponse.single(productRO, 'Produk berhasil dibuat');
  }

  async findAll(query: GetProductsDto) {
    // Build kondisi where tambahan
    const additionalWhere: any = {};

    if (query.category) {
      additionalWhere.category = query.category;
    }

    if (query.minPrice) {
      additionalWhere.price = {
        ...additionalWhere.price,
        gte: parseFloat(query.minPrice),
      };
    }

    if (query.maxPrice) {
      additionalWhere.price = {
        ...additionalWhere.price,
        lte: parseFloat(query.maxPrice),
      };
    }

    const result = await this.findWithPagination(
      this.prisma.product,
      query,
      {
        where: additionalWhere,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          createdAt: true,
          updatedAt: true,
        },
        searchFields: ['name', 'description'], // Pencarian di nama dan deskripsi
        orderBy: { createdAt: 'desc' }
      }
    );

    const productROs = result.data.map(product => plainToInstance(ProductRO, product));
    
    this.logOperation('Mengambil produk', `${result.data.length} dari ${result.totalItems} total`);

    return SuccessResponse.paginated(productROs, result.pagination, 'Data produk berhasil diambil');
  }

  async findOne(id: string) {
    if (!this.validateUUID(id)) {
      throw new BadRequestException('Format ID produk tidak valid');
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    this.logOperation('Mengambil produk', product.name);

    const productRO = plainToInstance(ProductRO, product);
    return SuccessResponse.single(productRO, 'Data produk berhasil diambil');
  }
}
```

### 3. Controller dengan Swagger
```typescript
// src/modules/product/product.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiExtraModels,
  ApiParam,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import {
  ApiCreatedResponse,
  ApiSuccessResponse,
  ApiPaginatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiAuthResponses,
} from '../../common/response/response.decorator';
import { ProductRO } from './ro/product.ro';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Product Management')
@ApiExtraModels(ProductRO)
@ApiBearerAuth()
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Membuat produk baru' })
  @ApiCreatedResponse('Produk berhasil dibuat', ProductRO)
  @ApiConflictResponse()
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mengambil daftar produk dengan filter dan pagination' })
  @ApiPaginatedResponse('Data produk berhasil diambil', ProductRO)
  @ApiBadRequestResponse()
  findAll(@Query() query: GetProductsDto) {
    return this.productService.findAll(query);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mengambil detail produk berdasarkan ID' })
  @ApiParam({
    name: 'id',
    description: 'ID unik produk',
    example: 'clh123abc456def789'
  })
  @ApiSuccessResponse('Data produk berhasil diambil', ProductRO)
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
}
```

### 4. Response Object (RO)
```typescript
// src/modules/product/ro/product.ro.ts
import { ApiProperty } from '@nestjs/swagger';

export class ProductRO {
  @ApiProperty({
    description: 'ID unik produk',
    example: 'clh123abc456def789'
  })
  id: string;

  @ApiProperty({
    description: 'Nama produk',
    example: 'iPhone 14 Pro'
  })
  name: string;

  @ApiProperty({
    description: 'Deskripsi produk',
    example: 'Smartphone terbaru dari Apple dengan teknologi canggih'
  })
  description: string;

  @ApiProperty({
    description: 'Harga produk',
    example: 15000000
  })
  price: number;

  @ApiProperty({
    description: 'Kategori produk',
    example: 'ELECTRONICS'
  })
  category: string;

  @ApiProperty({
    description: 'Tanggal pembuatan',
    example: '2025-08-18T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Tanggal terakhir diperbarui',
    example: '2025-08-18T10:30:00.000Z'
  })
  updatedAt: Date;
}
```

## Benefits Penggunaan Common Utilities

1. **Konsistensi**: Semua endpoint menggunakan format response yang sama
2. **DRY Principle**: Tidak perlu menulis ulang kode yang sama
3. **Type Safety**: TypeScript memberikan type checking yang baik
4. **Auto Documentation**: Swagger documentation ter-generate otomatis
5. **Error Handling**: Error handling yang konsisten di seluruh aplikasi
6. **Logging**: Logging yang terstruktur dan konsisten
7. **Validation**: Validasi yang seragam dengan pesan error bahasa Indonesia
8. **Maintainability**: Mudah di-maintain karena logic tersentralisasi
