# Time Service Documentation

## Overview

Time Service adalah utility service yang menyediakan abstraksi untuk operasi waktu dengan dukungan mocking untuk testing. Service ini memungkinkan aplikasi untuk menggunakan waktu real atau waktu mock yang dapat dikontrol untuk testing.

## Features

### ✅ **Core Time Operations**
- Get current time (real atau mock)
- Timestamp operations
- ISO string formatting
- Timezone support

### ✅ **Date Manipulation**
- Add/subtract days, hours, minutes
- Start/end of day, week, month, year
- Date comparison utilities
- Date range generation

### ✅ **Testing Support**
- Mock time untuk testing
- Advance mock time
- Clear mock time
- Check mock status

### ✅ **Business Logic Helpers**
- Business hours validation
- Subscription expiry checking
- Rate limiting support
- Report period calculation

## Basic Usage

### Import and Inject

```typescript
import { TimeService } from '../common/services/time.service';

@Injectable()
export class YourService {
  constructor(private timeService: TimeService) {}
}
```

### Current Time Operations

```typescript
// Get current time (real or mock)
const now = this.timeService.now();

// Get timestamp
const timestamp = this.timeService.nowTimestamp();

// Get ISO string
const iso = this.timeService.nowISO();

// Get time in specific timezone
const timeInNY = this.timeService.nowInTimezone('America/New_York');
```

### Date Manipulation

```typescript
const now = this.timeService.now();

// Add time
const tomorrow = this.timeService.addDays(now, 1);
const inTwoHours = this.timeService.addHours(now, 2);
const in30Minutes = this.timeService.addMinutes(now, 30);

// Subtract time
const yesterday = this.timeService.subtractDays(now, 1);

// Get start/end of periods
const startOfToday = this.timeService.startOfDay();
const endOfToday = this.timeService.endOfDay();
const startOfWeek = this.timeService.startOfWeek();
const startOfMonth = this.timeService.startOfMonth();
```

### Date Comparison

```typescript
const someDate = new Date('2023-01-15T10:30:00Z');

// Check if date is today
const isToday = this.timeService.isToday(someDate);

// Check if date is in past/future
const isPast = this.timeService.isPast(someDate);
const isFuture = this.timeService.isFuture(someDate);

// Calculate differences
const daysApart = this.timeService.diffInDays(date1, date2);
const hoursApart = this.timeService.diffInHours(date1, date2);

// Check if date is between two dates
const isBetween = this.timeService.isBetween(someDate, startDate, endDate);
```

### Date Ranges

```typescript
// Get predefined ranges
const todayRange = this.timeService.getDateRange('today');
const thisWeekRange = this.timeService.getDateRange('this_week');
const thisMonthRange = this.timeService.getDateRange('this_month');

console.log(todayRange); // { start: Date, end: Date }
```

## Testing with Mock Time

### Basic Mocking

```typescript
// In your test file
describe('Time-dependent tests', () => {
  let timeService: TimeService;

  beforeEach(() => {
    // Setup timeService...
  });

  afterEach(() => {
    // Always clear mock time after tests
    timeService.clearMockTime();
  });

  it('should handle expiry correctly', () => {
    // Set mock time
    const mockTime = new Date('2023-01-15T10:00:00Z');
    timeService.setMockTime(mockTime);

    // Now all time operations use mock time
    expect(timeService.now()).toEqual(mockTime);

    // Advance time by 2 hours
    timeService.advanceMockTimeByHours(2);
    expect(timeService.now()).toEqual(new Date('2023-01-15T12:00:00Z'));
  });
});
```

### Advanced Testing Examples

```typescript
it('should validate subscription expiry', () => {
  // Mock current time
  timeService.setMockTime(new Date('2023-01-15T10:00:00Z'));

  // Create subscription that expires in 30 days
  const expiresAt = timeService.addDays(timeService.now(), 30);
  
  // Should be active now
  expect(timeService.isFuture(expiresAt)).toBe(true);

  // Advance time past expiry
  timeService.advanceMockTimeByDays(31);
  
  // Should be expired now
  expect(timeService.isPast(expiresAt)).toBe(true);
});

it('should handle business hours', () => {
  // Mock Monday 9 AM
  timeService.setMockTime(new Date('2023-01-16T09:00:00Z'));
  
  const now = timeService.now();
  const day = now.getDay(); // 1 = Monday
  const hour = now.getHours(); // 9
  
  const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  expect(isBusinessHours).toBe(true);
});
```

## Real-world Usage Examples

### Token Expiry Management

```typescript
@Injectable()
export class TokenService {
  constructor(private timeService: TimeService) {}

  createToken(userId: string, expiresInMinutes: number = 60) {
    const expiresAt = this.timeService.addMinutes(this.timeService.now(), expiresInMinutes);
    
    return {
      token: 'generated-token',
      expiresAt,
      isValid: () => this.timeService.isFuture(expiresAt)
    };
  }

  isTokenExpired(expiresAt: Date): boolean {
    return this.timeService.isPast(expiresAt);
  }
}
```

### Report Generation

```typescript
@Injectable()
export class ReportService {
  constructor(private timeService: TimeService) {}

  async generateMonthlyReport() {
    const range = this.timeService.getDateRange('this_month');
    
    // Query data for this month
    const data = await this.getData(range.start, range.end);
    
    return {
      period: {
        start: this.timeService.format(range.start),
        end: this.timeService.format(range.end),
      },
      data,
      generatedAt: this.timeService.nowISO(),
    };
  }
}
```

### Rate Limiting

```typescript
@Injectable()
export class RateLimitService {
  constructor(private timeService: TimeService) {}

  checkRateLimit(userId: string, maxRequests: number = 100, windowMinutes: number = 60) {
    const now = this.timeService.now();
    const windowStart = this.timeService.subtractMinutes(now, windowMinutes);
    
    // Check requests in current window
    const requestsInWindow = this.getRequestsInWindow(userId, windowStart, now);
    
    return {
      allowed: requestsInWindow < maxRequests,
      remaining: Math.max(0, maxRequests - requestsInWindow),
      resetAt: this.timeService.addMinutes(windowStart, windowMinutes),
    };
  }
}
```

### Subscription Management

```typescript
@Injectable()
export class SubscriptionService {
  constructor(private timeService: TimeService) {}

  async checkSubscriptionStatus(subscriptionId: string) {
    const subscription = await this.getSubscription(subscriptionId);
    const now = this.timeService.now();
    
    if (this.timeService.isFuture(subscription.expiresAt)) {
      return { status: 'active', expiresAt: subscription.expiresAt };
    }
    
    // Check grace period (7 days after expiry)
    const gracePeriodEnd = this.timeService.addDays(subscription.expiresAt, 7);
    if (this.timeService.isFuture(gracePeriodEnd)) {
      return { status: 'grace_period', expiresAt: gracePeriodEnd };
    }
    
    return { status: 'expired', expiredAt: subscription.expiresAt };
  }
}
```

## Configuration

### Environment Variables

```bash
# Default timezone (optional, defaults to UTC)
TIMEZONE=UTC
# or
TIMEZONE=America/New_York
TIMEZONE=Asia/Jakarta
```

### App Configuration

```typescript
// config/app.config.ts
export const appConfig = registerAs('app', () => ({
  timezone: process.env.TIMEZONE || 'UTC',
}));
```

## Best Practices

### 1. Always Clear Mock Time in Tests

```typescript
afterEach(() => {
  timeService.clearMockTime();
});
```

### 2. Use Time Service Instead of Direct Date Operations

```typescript
// ❌ Don't do this
const now = new Date();
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

// ✅ Do this
const now = this.timeService.now();
const tomorrow = this.timeService.addDays(now, 1);
```

### 3. Test Time-Dependent Logic

```typescript
// ❌ Hard to test
const isExpired = new Date() > expiryDate;

// ✅ Easy to test
const isExpired = this.timeService.isPast(expiryDate);
```

### 4. Use Timezone-Aware Operations

```typescript
// Format dates with timezone consideration
const formatted = this.timeService.format(date, {
  timeZone: 'America/New_York',
  dateStyle: 'medium',
  timeStyle: 'short'
});
```

## API Reference

### Core Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `now()` | Get current time (real or mock) | `Date` |
| `nowTimestamp()` | Get current timestamp in ms | `number` |
| `nowISO()` | Get current time as ISO string | `string` |
| `format(date, options?)` | Format date with options | `string` |

### Date Manipulation

| Method | Description | Return Type |
|--------|-------------|-------------|
| `addDays(date, days)` | Add days to date | `Date` |
| `addHours(date, hours)` | Add hours to date | `Date` |
| `addMinutes(date, minutes)` | Add minutes to date | `Date` |
| `subtractDays(date, days)` | Subtract days from date | `Date` |
| `startOfDay(date?)` | Get start of day | `Date` |
| `endOfDay(date?)` | Get end of day | `Date` |

### Date Comparison

| Method | Description | Return Type |
|--------|-------------|-------------|
| `isToday(date)` | Check if date is today | `boolean` |
| `isPast(date)` | Check if date is in past | `boolean` |
| `isFuture(date)` | Check if date is in future | `boolean` |
| `diffInDays(date1, date2)` | Get difference in days | `number` |
| `isBetween(date, start, end)` | Check if date is between two dates | `boolean` |

### Testing Methods

| Method | Description | Return Type |
|--------|-------------|-------------|
| `setMockTime(date)` | Set mock time for testing | `void` |
| `clearMockTime()` | Clear mock time | `void` |
| `isMocked()` | Check if time is mocked | `boolean` |
| `advanceMockTime(ms)` | Advance mock time by milliseconds | `void` |
| `advanceMockTimeByDays(days)` | Advance mock time by days | `void` |

## Common Use Cases

### 1. Authentication Token Expiry
### 2. Subscription Management
### 3. Rate Limiting
### 4. Report Generation
### 5. Business Hours Validation
### 6. Cron Job Scheduling
### 7. Cache TTL Management
### 8. Audit Trail Timestamps

Dengan Time Service ini, aplikasi Anda akan lebih mudah di-test dan lebih fleksibel dalam handling waktu! 🕰️
