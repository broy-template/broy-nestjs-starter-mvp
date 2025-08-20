import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TimeService } from './time.service';

describe('TimeService', () => {
  let service: TimeService;
  let configService: ConfigService;

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

    service = module.get<TimeService>(TimeService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    // Clear any mock time after each test
    service.clearMockTime();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Real Time Operations', () => {
    it('should return current time', () => {
      const now = service.now();
      const realNow = new Date();
      
      // Should be within 1 second of each other
      expect(Math.abs(now.getTime() - realNow.getTime())).toBeLessThan(1000);
    });

    it('should return current timestamp', () => {
      const timestamp = service.nowTimestamp();
      const realTimestamp = Date.now();
      
      expect(Math.abs(timestamp - realTimestamp)).toBeLessThan(1000);
    });

    it('should return ISO string', () => {
      const iso = service.nowISO();
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('Mock Time Operations', () => {
    it('should set and use mock time', () => {
      const mockDate = new Date('2023-01-15T10:30:00Z');
      service.setMockTime(mockDate);

      expect(service.isMocked()).toBe(true);
      expect(service.now()).toEqual(mockDate);
      expect(service.nowTimestamp()).toBe(mockDate.getTime());
      expect(service.getMockTime()).toEqual(mockDate);
    });

    it('should set mock time from string', () => {
      const mockDateString = '2023-01-15T10:30:00Z';
      service.setMockTime(mockDateString);

      expect(service.isMocked()).toBe(true);
      expect(service.now()).toEqual(new Date(mockDateString));
    });

    it('should clear mock time', () => {
      service.setMockTime(new Date());
      expect(service.isMocked()).toBe(true);

      service.clearMockTime();
      expect(service.isMocked()).toBe(false);
      expect(service.getMockTime()).toBeNull();
    });

    it('should advance mock time', () => {
      const mockDate = new Date('2023-01-15T10:30:00Z');
      service.setMockTime(mockDate);

      service.advanceMockTime(5000); // 5 seconds
      expect(service.now()).toEqual(new Date('2023-01-15T10:30:05Z'));
    });

    it('should advance mock time by days', () => {
      const mockDate = new Date('2023-01-15T10:30:00Z');
      service.setMockTime(mockDate);

      service.advanceMockTimeByDays(2);
      expect(service.now()).toEqual(new Date('2023-01-17T10:30:00Z'));
    });

    it('should advance mock time by hours', () => {
      const mockDate = new Date('2023-01-15T10:30:00Z');
      service.setMockTime(mockDate);

      service.advanceMockTimeByHours(3);
      expect(service.now()).toEqual(new Date('2023-01-15T13:30:00Z'));
    });
  });

  describe('Date Manipulation', () => {
    beforeEach(() => {
      // Use consistent mock time for date manipulation tests
      service.setMockTime(new Date('2023-01-15T10:30:00Z'));
    });

    it('should get start of day', () => {
      const startOfDay = service.startOfDay();
      expect(startOfDay).toEqual(new Date('2023-01-15T00:00:00.000Z'));
    });

    it('should get end of day', () => {
      const endOfDay = service.endOfDay();
      expect(endOfDay).toEqual(new Date('2023-01-15T23:59:59.999Z'));
    });

    it('should add days', () => {
      const date = new Date('2023-01-15T10:30:00Z');
      const newDate = service.addDays(date, 5);
      expect(newDate).toEqual(new Date('2023-01-20T10:30:00Z'));
    });

    it('should subtract days', () => {
      const date = new Date('2023-01-15T10:30:00Z');
      const newDate = service.subtractDays(date, 3);
      expect(newDate).toEqual(new Date('2023-01-12T10:30:00Z'));
    });

    it('should add hours', () => {
      const date = new Date('2023-01-15T10:30:00Z');
      const newDate = service.addHours(date, 2);
      expect(newDate).toEqual(new Date('2023-01-15T12:30:00Z'));
    });

    it('should add minutes', () => {
      const date = new Date('2023-01-15T10:30:00Z');
      const newDate = service.addMinutes(date, 45);
      expect(newDate).toEqual(new Date('2023-01-15T11:15:00Z'));
    });
  });

  describe('Date Comparison', () => {
    beforeEach(() => {
      service.setMockTime(new Date('2023-01-15T10:30:00Z'));
    });

    it('should check if date is today', () => {
      const today = new Date('2023-01-15T15:00:00Z');
      const notToday = new Date('2023-01-14T15:00:00Z');

      expect(service.isToday(today)).toBe(true);
      expect(service.isToday(notToday)).toBe(false);
    });

    it('should check if date is yesterday', () => {
      const yesterday = new Date('2023-01-14T15:00:00Z');
      const notYesterday = new Date('2023-01-13T15:00:00Z');

      expect(service.isYesterday(yesterday)).toBe(true);
      expect(service.isYesterday(notYesterday)).toBe(false);
    });

    it('should check if date is in past', () => {
      const pastDate = new Date('2023-01-14T10:30:00Z');
      const futureDate = new Date('2023-01-16T10:30:00Z');

      expect(service.isPast(pastDate)).toBe(true);
      expect(service.isPast(futureDate)).toBe(false);
    });

    it('should check if date is in future', () => {
      const pastDate = new Date('2023-01-14T10:30:00Z');
      const futureDate = new Date('2023-01-16T10:30:00Z');

      expect(service.isFuture(futureDate)).toBe(true);
      expect(service.isFuture(pastDate)).toBe(false);
    });

    it('should calculate difference in days', () => {
      const date1 = new Date('2023-01-15T10:30:00Z');
      const date2 = new Date('2023-01-18T10:30:00Z');

      expect(service.diffInDays(date1, date2)).toBe(3);
    });

    it('should check if date is between two dates', () => {
      const start = new Date('2023-01-10T10:30:00Z');
      const end = new Date('2023-01-20T10:30:00Z');
      const between = new Date('2023-01-15T10:30:00Z');
      const outside = new Date('2023-01-25T10:30:00Z');

      expect(service.isBetween(between, start, end)).toBe(true);
      expect(service.isBetween(outside, start, end)).toBe(false);
    });
  });

  describe('Date Ranges', () => {
    beforeEach(() => {
      // Mock time: Sunday, Jan 15, 2023, 10:30 AM UTC
      service.setMockTime(new Date('2023-01-15T10:30:00Z'));
    });

    it('should get today range', () => {
      const range = service.getDateRange('today');
      expect(range.start).toEqual(new Date('2023-01-15T00:00:00.000Z'));
      expect(range.end).toEqual(new Date('2023-01-15T23:59:59.999Z'));
    });

    it('should get yesterday range', () => {
      const range = service.getDateRange('yesterday');
      expect(range.start).toEqual(new Date('2023-01-14T00:00:00.000Z'));
      expect(range.end).toEqual(new Date('2023-01-14T23:59:59.999Z'));
    });

    it('should get this month range', () => {
      const range = service.getDateRange('this_month');
      expect(range.start).toEqual(new Date('2023-01-01T00:00:00.000Z'));
      expect(range.end).toEqual(new Date('2023-01-15T23:59:59.999Z'));
    });
  });

  describe('Utility Methods', () => {
    it('should parse valid date string', () => {
      const dateString = '2023-01-15T10:30:00Z';
      const parsed = service.parseDate(dateString);
      expect(parsed).toEqual(new Date(dateString));
    });

    it('should return null for invalid date string', () => {
      const invalidDate = 'invalid-date';
      const parsed = service.parseDate(invalidDate);
      expect(parsed).toBeNull();
    });

    it('should format date', () => {
      const date = new Date('2023-01-15T10:30:00Z');
      const formatted = service.format(date);
      expect(formatted).toContain('2023');
      expect(formatted).toContain('01');
      expect(formatted).toContain('15');
    });

    it('should manage timezone settings', () => {
      expect(service.getDefaultTimezone()).toBe('UTC');
      
      service.setDefaultTimezone('America/New_York');
      expect(service.getDefaultTimezone()).toBe('America/New_York');
    });
  });
});
