# Common Utilities Documentation

## Overview
Folder `common` berisi utility, helper, service, dan decorator yang dapat digunakan di seluruh aplikasi.

## Structure

```
src/common/
├── decorators/
│   ├── current-user.decorator.ts     # Decorator untuk mendapatkan user saat ini
│   ├── public.decorator.ts           # Decorator untuk endpoint publik
│   ├── roles.decorator.ts            # Decorator untuk authorization role
│   └── validation.decorator.ts       # Decorator validasi custom
├── dto/
│   ├── query.dto.ts                  # DTO untuk query pagination dan search
│   └── user.dto.ts                   # DTO untuk user response
├── guards/
│   ├── jwt-auth.guard.ts             # Guard untuk authentication JWT
│   ├── jwt-refresh-auth.guard.ts     # Guard untuk refresh token
│   └── roles.guard.ts                # Guard untuk authorization role
├── helpers/
│   ├── pagination.helper.ts          # Helper untuk pagination
│   ├── response.helper.ts            # Helper untuk standardisasi response
│   └── validation.helper.ts          # Helper untuk validasi umum
├── services/
│   └── base.service.ts               # Base service dengan fungsi CRUD umum
├── response/
│   ├── api-response.ts               # Interface dan class untuk response API
│   └── response.decorator.ts         # Decorator Swagger untuk response
├── prisma.module.ts                  # Module untuk Prisma
├── prisma.service.ts                 # Service untuk Prisma
└── index.ts                          # Export semua utilities
```

## Penggunaan

### 1. BaseQueryDto
Gunakan untuk pagination dan search di semua endpoint list:

```typescript
import { BaseQueryDto } from '../../../common/dto/query.dto';

export class GetProductsDto extends BaseQueryDto {
  @ApiProperty({ enum: ProductCategory, required: false })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;
}
```

### 2. BaseService
Extend dari BaseService untuk mendapatkan fungsi CRUD umum:

```typescript
import { BaseService } from '../../common/services/base.service';

@Injectable()
export class ProductService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma, ProductService.name);
  }

  async findAll(query: GetProductsDto) {
    const result = await this.findWithPagination(
      this.prisma.product,
      query,
      {
        where: { category: query.category },
        select: { id: true, name: true, price: true },
        searchFields: ['name', 'description'],
      }
    );

    return SuccessResponse.paginated(result.data, result.pagination);
  }
}
```

### 3. Validation Decorators
Gunakan decorator validasi custom untuk konsistensi:

```typescript
import { IsValidEmail, IsSecurePassword, IsValidUUID } from '../../../common/decorators/validation.decorator';

export class CreateProductDto {
  @IsValidEmail('Email penjual')
  sellerEmail: string;

  @IsValidUUID('ID kategori')
  categoryId: string;
}
```

### 4. Response Helpers
Gunakan helper untuk response yang konsisten:

```typescript
import { ResponseHelper } from '../../common/helpers/response.helper';

// Untuk response sukses
return ResponseHelper.success(data, 'Produk berhasil dibuat');

// Untuk response dengan pagination
return ResponseHelper.successPaginated(products, pagination, 'Data produk berhasil diambil');

// Untuk response delete
return ResponseHelper.deleted('Produk berhasil dihapus');
```

### 5. Guards dan Decorators
Guards sudah diterapkan secara global di AppModule:

```typescript
// Di controller, gunakan decorator untuk authorization
@Roles('ADMIN', 'MANAGER')
@Delete(':id')
async deleteProduct(@Param('id') id: string) {
  return this.productService.remove(id);
}

// Untuk endpoint publik
@Public()
@Get('featured')
async getFeaturedProducts() {
  return this.productService.findFeatured();
}
```

## Best Practices

1. **Selalu gunakan BaseQueryDto** untuk endpoint yang mengembalikan list data
2. **Extend BaseService** untuk service yang membutuhkan operasi CRUD standar
3. **Gunakan validation decorators** yang sudah tersedia untuk konsistensi
4. **Manfaatkan response helpers** untuk standardisasi format response
5. **Log operasi** menggunakan helper dari BaseService
6. **Validasi UUID** sebelum operasi database

## Error Handling

Semua helper sudah dilengkapi dengan error handling yang sesuai:
- BadRequestException untuk input tidak valid
- NotFoundException untuk data tidak ditemukan
- ConflictException untuk data duplikat

## Logging

BaseService sudah dilengkapi dengan logging yang konsisten:
- `logOperation()` untuk operasi berhasil
- `logError()` untuk operasi gagal
