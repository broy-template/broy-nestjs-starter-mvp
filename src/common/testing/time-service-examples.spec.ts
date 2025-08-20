import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TimeService } from '../services/time.service';

// Example showing how to test time-dependent functionality
describe('Time-dependent Business Logic Testing', () => {
  let timeService: TimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'app.timezone':
                  return 'UTC';
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    timeService = module.get<TimeService>(TimeService);
  });

  afterEach(() => {
    timeService.clearMockTime();
  });

  describe('Business Hours Validation', () => {
    it('should validate business hours correctly', () => {
      // Mock time to Monday 9:00 AM
      timeService.setMockTime(new Date('2023-01-16T09:00:00Z')); // Monday

      const isBusinessHours = checkBusinessHours(timeService);
      expect(isBusinessHours).toBe(true);

      // Mock time to Saturday 9:00 AM
      timeService.setMockTime(new Date('2023-01-14T09:00:00Z')); // Saturday
      
      const isWeekend = checkBusinessHours(timeService);
      expect(isWeekend).toBe(false);
    });

    it('should handle timezone-specific business hours', () => {
      // Mock time to 2:00 PM UTC (which is 9:00 AM EST)
      timeService.setMockTime(new Date('2023-01-16T14:00:00Z'));

      const isBusinessHoursEST = checkBusinessHoursInTimezone(timeService, 'America/New_York');
      expect(isBusinessHoursEST).toBe(true);
    });
  });

  describe('Subscription Expiry Testing', () => {
    it('should handle subscription expiry correctly', () => {
      // Mock current time
      const currentTime = new Date('2023-01-15T10:00:00Z');
      timeService.setMockTime(currentTime);

      // Create subscription that expires in 30 days
      const subscription = createSubscription(timeService, 30);
      
      expect(isSubscriptionActive(subscription, timeService)).toBe(true);

      // Advance time by 31 days
      timeService.advanceMockTimeByDays(31);
      
      expect(isSubscriptionActive(subscription, timeService)).toBe(false);
    });

    it('should handle grace period correctly', () => {
      const currentTime = new Date('2023-01-15T10:00:00Z');
      timeService.setMockTime(currentTime);

      const subscription = createSubscription(timeService, 30);
      
      // Advance to 2 days after expiry
      timeService.advanceMockTimeByDays(32);
      
      expect(isInGracePeriod(subscription, timeService)).toBe(true);

      // Advance to 8 days after expiry (past grace period)
      timeService.advanceMockTimeByDays(6); // total 38 days
      
      expect(isInGracePeriod(subscription, timeService)).toBe(false);
    });
  });

  describe('Report Generation Testing', () => {
    it('should generate monthly report for correct period', () => {
      // Mock time to mid-February
      timeService.setMockTime(new Date('2023-02-15T10:00:00Z'));

      const reportPeriod = getMonthlyReportPeriod(timeService);
      
      expect(reportPeriod.start).toEqual(new Date('2023-02-01T00:00:00.000Z'));
      expect(reportPeriod.end.getUTCMonth()).toBe(1); // February (0-indexed)
      expect(reportPeriod.end.getUTCDate()).toBe(15);
    });

    it('should handle end-of-month edge cases', () => {
      // Mock time to last day of January
      timeService.setMockTime(new Date('2023-01-31T23:59:59Z'));

      const reportPeriod = getMonthlyReportPeriod(timeService);
      
      expect(reportPeriod.start).toEqual(new Date('2023-01-01T00:00:00.000Z'));
      expect(reportPeriod.end.getUTCDate()).toBe(31);
    });
  });

  describe('Task Scheduling Testing', () => {
    it('should schedule daily tasks correctly', () => {
      // Mock time to 8:00 AM
      timeService.setMockTime(new Date('2023-01-15T08:00:00Z'));

      const nextRun = getNextDailyTaskRun(timeService);
      
      // Should be scheduled for next day at 8:00 AM
      expect(nextRun).toEqual(new Date('2023-01-16T08:00:00Z'));
    });

    it('should handle weekly task scheduling', () => {
      // Mock time to Wednesday
      timeService.setMockTime(new Date('2023-01-18T10:00:00Z')); // Wednesday

      const nextWeeklyRun = getNextWeeklyTaskRun(timeService);
      
      // Should be scheduled for next Monday
      expect(nextWeeklyRun.getDay()).toBe(1); // Monday
      expect(nextWeeklyRun > timeService.now()).toBe(true);
    });
  });

  describe('Rate Limiting Testing', () => {
    it('should handle rate limit reset timing', () => {
      const currentTime = new Date('2023-01-15T10:00:00Z');
      timeService.setMockTime(currentTime);

      const rateLimitData = createRateLimit(timeService);
      
      expect(canMakeRequest(rateLimitData, timeService)).toBe(true);

      // Simulate reaching rate limit
      rateLimitData.requests = rateLimitData.maxRequests;
      expect(canMakeRequest(rateLimitData, timeService)).toBe(false);

      // Advance time past reset window (slightly more than 1 hour to ensure precision)
      timeService.advanceMockTimeByHours(1);
      timeService.advanceMockTime(1); // Add 1ms to ensure we're past the reset time
      
      expect(canMakeRequest(rateLimitData, timeService)).toBe(true);
    });
  });
});

// Helper functions for testing examples

interface Subscription {
  expiresAt: Date;
  gracePeriodDays: number;
}

interface RateLimit {
  requests: number;
  maxRequests: number;
  resetAt: Date;
}

function checkBusinessHours(timeService: TimeService): boolean {
  const now = timeService.now();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const hour = now.getHours();

  // Monday to Friday, 9 AM to 5 PM
  return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
}

function checkBusinessHoursInTimezone(timeService: TimeService, timezone: string): boolean {
  const now = timeService.now();
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const day = localTime.getDay();
  const hour = localTime.getHours();

  return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
}

function createSubscription(timeService: TimeService, daysFromNow: number): Subscription {
  return {
    expiresAt: timeService.addDays(timeService.now(), daysFromNow),
    gracePeriodDays: 7,
  };
}

function isSubscriptionActive(subscription: Subscription, timeService: TimeService): boolean {
  return timeService.isFuture(subscription.expiresAt);
}

function isInGracePeriod(subscription: Subscription, timeService: TimeService): boolean {
  if (isSubscriptionActive(subscription, timeService)) {
    return false; // Still active, no grace period needed
  }

  const gracePeriodEnd = timeService.addDays(subscription.expiresAt, subscription.gracePeriodDays);
  return timeService.isFuture(gracePeriodEnd);
}

function getMonthlyReportPeriod(timeService: TimeService): { start: Date; end: Date } {
  const now = timeService.now();
  const start = timeService.startOfMonth(now);
  const end = timeService.endOfDay(now);
  
  return { start, end };
}

function getNextDailyTaskRun(timeService: TimeService): Date {
  const now = timeService.now();
  const tomorrow = timeService.addDays(now, 1);
  const nextRun = new Date(tomorrow);
  nextRun.setUTCHours(8, 0, 0, 0); // 8:00 AM UTC
  
  return nextRun;
}

function getNextWeeklyTaskRun(timeService: TimeService): Date {
  const now = timeService.now();
  const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
  const nextMonday = timeService.addDays(now, daysUntilMonday);
  nextMonday.setUTCHours(9, 0, 0, 0); // 9:00 AM UTC on Monday
  
  return nextMonday;
}

function createRateLimit(timeService: TimeService): RateLimit {
  return {
    requests: 0,
    maxRequests: 100,
    resetAt: timeService.addHours(timeService.now(), 1),
  };
}

function canMakeRequest(rateLimit: RateLimit, timeService: TimeService): boolean {
  const now = timeService.now();
  
  // Reset if time window has passed
  if (timeService.isPast(rateLimit.resetAt)) {
    rateLimit.requests = 0;
    rateLimit.resetAt = timeService.addHours(now, 1);
  }
  
  return rateLimit.requests < rateLimit.maxRequests;
}
