# Cache Service Documentation

## Overview

Cache Service menyediakan abstraksi untuk operasi caching dengan implementasi in-memory yang dapat di-extend ke Redis atau cache provider lainnya. Service ini membantu meningkatkan performance aplikasi dengan menyimpan data yang sering diakses.

## Features

### ✅ **Core Operations**
- Get/Set/Delete cache entries
- TTL (Time To Live) support
- Clear all cache
- Remember pattern (cache-aside)

### ✅ **Helper Methods**
- User-specific cache keys
- Common cache patterns
- Cache expiry management

## Basic Usage

### Import and Inject

```typescript
import { CacheService } from '../common/services/cache.service';

@Injectable()
export class YourService {
  constructor(private cacheService: CacheService) {}
}
```

### Basic Operations

```typescript
// Set cache with TTL (default 3600 seconds)
await this.cacheService.set('user:123', userData, 1800); // 30 minutes

// Get cache
const userData = await this.cacheService.get<User>('user:123');

// Delete cache
await this.cacheService.del('user:123');

// Clear all cache
await this.cacheService.clear();
```

### Remember Pattern

```typescript
// Cache-aside pattern
const userData = await this.cacheService.remember(
  'user:123',
  1800, // TTL in seconds
  async () => {
    // This callback is called only if cache miss
    return await this.userRepository.findById(123);
  }
);
```

## Real-world Examples

### User Profile Caching

```typescript
@Injectable()
export class UserService {
  constructor(
    private cacheService: CacheService,
    private prisma: PrismaService
  ) {}

  async getUserProfile(userId: string): Promise<UserProfile> {
    const cacheKey = this.cacheService.getUserCacheKey(userId, 'profile');
    
    return this.cacheService.remember(
      cacheKey,
      3600, // 1 hour
      async () => {
        return await this.prisma.userProfile.findUnique({
          where: { userId },
          include: { user: true }
        });
      }
    );
  }

  async updateUserProfile(userId: string, data: UpdateProfileDto): Promise<UserProfile> {
    // Update in database
    const profile = await this.prisma.userProfile.update({
      where: { userId },
      data,
      include: { user: true }
    });

    // Update cache
    const cacheKey = this.cacheService.getUserCacheKey(userId, 'profile');
    await this.cacheService.set(cacheKey, profile, 3600);

    return profile;
  }

  async deleteUserProfile(userId: string): Promise<void> {
    // Delete from database
    await this.prisma.userProfile.delete({
      where: { userId }
    });

    // Remove from cache
    const cacheKey = this.cacheService.getUserCacheKey(userId, 'profile');
    await this.cacheService.del(cacheKey);
  }
}
```

### API Response Caching

```typescript
@Injectable()
export class ProductService {
  constructor(private cacheService: CacheService) {}

  async getProducts(query: GetProductsDto): Promise<Product[]> {
    const cacheKey = `products:${JSON.stringify(query)}`;
    
    return this.cacheService.remember(
      cacheKey,
      600, // 10 minutes
      async () => {
        return await this.prisma.product.findMany({
          where: {
            ...(query.category && { category: query.category }),
            ...(query.status && { status: query.status }),
          },
          orderBy: { createdAt: 'desc' }
        });
      }
    );
  }
}
```

### Configuration Caching

```typescript
@Injectable()
export class ConfigService {
  constructor(private cacheService: CacheService) {}

  async getAppSettings(): Promise<AppSettings> {
    return this.cacheService.remember(
      'app:settings',
      7200, // 2 hours
      async () => {
        return await this.prisma.settings.findFirst({
          where: { isActive: true }
        });
      }
    );
  }

  async updateAppSettings(settings: UpdateSettingsDto): Promise<AppSettings> {
    const updated = await this.prisma.settings.update({
      where: { id: settings.id },
      data: settings
    });

    // Update cache immediately
    await this.cacheService.set('app:settings', updated, 7200);

    return updated;
  }
}
```

## Best Practices

### 1. Use Consistent Cache Keys

```typescript
// ✅ Good - consistent naming
getUserCacheKey(userId: string, suffix: string): string {
  return `user:${userId}:${suffix}`;
}

const profileKey = this.getUserCacheKey('123', 'profile');
const settingsKey = this.getUserCacheKey('123', 'settings');
```

### 2. Set Appropriate TTL

```typescript
// Different TTL for different data types
const USER_PROFILE_TTL = 3600; // 1 hour - changes occasionally
const PRODUCT_LIST_TTL = 600;  // 10 minutes - changes frequently
const APP_CONFIG_TTL = 7200;   // 2 hours - rarely changes
```

### 3. Handle Cache Invalidation

```typescript
async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
  const user = await this.prisma.user.update({
    where: { id: userId },
    data
  });

  // Invalidate related caches
  await this.cacheService.del(this.getUserCacheKey(userId, 'profile'));
  await this.cacheService.del(this.getUserCacheKey(userId, 'settings'));

  return user;
}
```

### 4. Use Type Safety

```typescript
interface CachedUser {
  id: string;
  email: string;
  profile?: UserProfile;
}

const user = await this.cacheService.get<CachedUser>('user:123');
```

## Cache Strategies

### 1. Cache-Aside (Lazy Loading)

```typescript
async getUser(id: string): Promise<User> {
  // Try cache first
  let user = await this.cacheService.get<User>(`user:${id}`);
  
  if (!user) {
    // Cache miss - load from database
    user = await this.userRepository.findById(id);
    
    if (user) {
      // Store in cache
      await this.cacheService.set(`user:${id}`, user, 3600);
    }
  }
  
  return user;
}
```

### 2. Write-Through

```typescript
async createUser(userData: CreateUserDto): Promise<User> {
  // Write to database
  const user = await this.userRepository.create(userData);
  
  // Write to cache
  await this.cacheService.set(`user:${user.id}`, user, 3600);
  
  return user;
}
```

### 3. Write-Behind (Write-Back)

```typescript
async updateUserProfile(userId: string, data: UpdateProfileDto): Promise<void> {
  // Update cache immediately
  const cacheKey = `user:${userId}:profile`;
  await this.cacheService.set(cacheKey, data, 3600);
  
  // Schedule background database update
  this.scheduleDbUpdate(userId, data);
}
```

## Testing

### Mock Cache Service

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      remember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockCacheService = module.get(CacheService);
  });

  it('should use cache when available', async () => {
    const cachedUser = { id: '1', email: 'test@example.com' };
    mockCacheService.get.mockResolvedValue(cachedUser);

    const result = await service.getUser('1');

    expect(mockCacheService.get).toHaveBeenCalledWith('user:1');
    expect(result).toEqual(cachedUser);
  });
});
```

## Performance Considerations

### 1. Cache Size Management

```typescript
// Monitor cache size
const cacheStats = {
  totalKeys: this.cache.size,
  memoryUsage: process.memoryUsage().heapUsed,
};
```

### 2. Cache Hit Rate Monitoring

```typescript
class CacheMetrics {
  private hits = 0;
  private misses = 0;

  recordHit() { this.hits++; }
  recordMiss() { this.misses++; }

  getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }
}
```

## Migration to Redis

Ketika aplikasi berkembang, Anda dapat mengextend ke Redis:

```typescript
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisCacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

## API Reference

### Core Methods

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| `get<T>(key)` | Get cache value | key: string | `Promise<T \| null>` |
| `set(key, value, ttl?)` | Set cache value | key: string, value: any, ttl?: number | `Promise<void>` |
| `del(key)` | Delete cache entry | key: string | `Promise<void>` |
| `clear()` | Clear all cache | - | `Promise<void>` |
| `remember<T>(key, ttl, callback)` | Cache-aside pattern | key: string, ttl: number, callback: () => Promise<T> | `Promise<T>` |

### Helper Methods

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| `getUserCacheKey(userId, suffix)` | Generate user cache key | userId: string, suffix: string | `string` |
| `cacheUserProfile(userId, profile, ttl?)` | Cache user profile | userId: string, profile: any, ttl?: number | `Promise<void>` |
| `getUserProfile(userId)` | Get cached user profile | userId: string | `Promise<any>` |

Cache Service ini memberikan foundation yang solid untuk caching strategy di aplikasi MVP Anda! 🚀
