import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, { value: any; expiry: number }>();

  constructor(private configService: ConfigService) {}

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  // Helper methods for common patterns
  async remember<T>(
    key: string,
    ttl: number,
    callback: () => Promise<T>
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === null) {
      value = await callback();
      await this.set(key, value, ttl);
    }
    
    return value;
  }

  // User-specific cache helpers
  getUserCacheKey(userId: string, suffix: string): string {
    return `user:${userId}:${suffix}`;
  }

  // Common cache patterns
  async cacheUserProfile(userId: string, profile: any, ttl: number = 3600): Promise<void> {
    await this.set(this.getUserCacheKey(userId, 'profile'), profile, ttl);
  }

  async getUserProfile(userId: string): Promise<any> {
    return this.get(this.getUserCacheKey(userId, 'profile'));
  }
}
