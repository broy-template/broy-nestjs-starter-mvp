import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TimeOptions {
  timezone?: string;
  format?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

@Injectable()
export class TimeService {
  private mockTime: Date | null = null;
  private defaultTimezone: string;

  constructor(private configService: ConfigService) {
    this.defaultTimezone = this.configService.get('app.timezone') || 'UTC';
  }

  /**
   * Get current time (real or mocked)
   */
  now(): Date {
    return this.mockTime || new Date();
  }

  /**
   * Get current timestamp in milliseconds
   */
  nowTimestamp(): number {
    return this.now().getTime();
  }

  /**
   * Get current ISO string
   */
  nowISO(): string {
    return this.now().toISOString();
  }

  /**
   * Get current time in specific timezone
   */
  nowInTimezone(timezone: string = this.defaultTimezone): string {
    return this.now().toLocaleString('en-US', { timeZone: timezone });
  }

  /**
   * Format date with options
   */
  format(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: this.defaultTimezone,
    };

    return date.toLocaleString('en-US', { ...defaultOptions, ...options });
  }

  /**
   * Get start of day
   */
  startOfDay(date?: Date): Date {
    const targetDate = date || this.now();
    if (this.defaultTimezone === 'UTC') {
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      return startOfDay;
    } else {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      return startOfDay;
    }
  }

  /**
   * Get end of day
   */
  endOfDay(date?: Date): Date {
    const targetDate = date || this.now();
    if (this.defaultTimezone === 'UTC') {
      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      return endOfDay;
    } else {
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay;
    }
  }

  /**
   * Get start of week (Monday)
   */
  startOfWeek(date?: Date): Date {
    const targetDate = date || this.now();
    const startOfWeek = new Date(targetDate);
    if (this.defaultTimezone === 'UTC') {
      const day = startOfWeek.getUTCDay();
      const diff = startOfWeek.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday as first day
      startOfWeek.setUTCDate(diff);
    } else {
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
      startOfWeek.setDate(diff);
    }
    return this.startOfDay(startOfWeek);
  }

  /**
   * Get start of month
   */
  startOfMonth(date?: Date): Date {
    const targetDate = date || this.now();
    if (this.defaultTimezone === 'UTC') {
      return new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), 1));
    } else {
      return new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    }
  }

  /**
   * Get start of year
   */
  startOfYear(date?: Date): Date {
    const targetDate = date || this.now();
    if (this.defaultTimezone === 'UTC') {
      return new Date(Date.UTC(targetDate.getUTCFullYear(), 0, 1));
    } else {
      return new Date(targetDate.getFullYear(), 0, 1);
    }
  }

  /**
   * Add days to date
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    if (this.defaultTimezone === 'UTC') {
      result.setUTCDate(result.getUTCDate() + days);
    } else {
      result.setDate(result.getDate() + days);
    }
    return result;
  }

  /**
   * Add hours to date
   */
  addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    if (this.defaultTimezone === 'UTC') {
      result.setUTCHours(result.getUTCHours() + hours);
    } else {
      result.setHours(result.getHours() + hours);
    }
    return result;
  }

  /**
   * Add minutes to date
   */
  addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    if (this.defaultTimezone === 'UTC') {
      result.setUTCMinutes(result.getUTCMinutes() + minutes);
    } else {
      result.setMinutes(result.getMinutes() + minutes);
    }
    return result;
  }

  /**
   * Subtract days from date
   */
  subtractDays(date: Date, days: number): Date {
    return this.addDays(date, -days);
  }

  /**
   * Check if date is today
   */
  isToday(date: Date): boolean {
    const today = this.startOfDay();
    const targetDate = this.startOfDay(date);
    return today.getTime() === targetDate.getTime();
  }

  /**
   * Check if date is yesterday
   */
  isYesterday(date: Date): boolean {
    const yesterday = this.subtractDays(this.startOfDay(), 1);
    const targetDate = this.startOfDay(date);
    return yesterday.getTime() === targetDate.getTime();
  }

  /**
   * Check if date is in the past
   */
  isPast(date: Date): boolean {
    return date.getTime() < this.nowTimestamp();
  }

  /**
   * Check if date is in the future
   */
  isFuture(date: Date): boolean {
    return date.getTime() > this.nowTimestamp();
  }

  /**
   * Get difference in days between two dates
   */
  diffInDays(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get difference in hours between two dates
   */
  diffInHours(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * Get difference in minutes between two dates
   */
  diffInMinutes(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60));
  }

  /**
   * Check if date is between two dates
   */
  isBetween(date: Date, start: Date, end: Date): boolean {
    const time = date.getTime();
    return time >= start.getTime() && time <= end.getTime();
  }

  /**
   * Get date range for common periods
   */
  getDateRange(period: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year'): DateRange {
    const now = this.now();
    
    switch (period) {
      case 'today':
        return {
          start: this.startOfDay(now),
          end: this.endOfDay(now),
        };
      
      case 'yesterday':
        const yesterday = this.subtractDays(now, 1);
        return {
          start: this.startOfDay(yesterday),
          end: this.endOfDay(yesterday),
        };
      
      case 'this_week':
        return {
          start: this.startOfWeek(now),
          end: this.endOfDay(now),
        };
      
      case 'last_week':
        const lastWeekStart = this.subtractDays(this.startOfWeek(now), 7);
        const lastWeekEnd = this.subtractDays(this.startOfWeek(now), 1);
        return {
          start: lastWeekStart,
          end: this.endOfDay(lastWeekEnd),
        };
      
      case 'this_month':
        return {
          start: this.startOfMonth(now),
          end: this.endOfDay(now),
        };
      
      case 'last_month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return {
          start: this.startOfMonth(lastMonth),
          end: this.endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
        };
      
      case 'this_year':
        return {
          start: this.startOfYear(now),
          end: this.endOfDay(now),
        };
      
      default:
        return {
          start: this.startOfDay(now),
          end: this.endOfDay(now),
        };
    }
  }

  /**
   * Parse string to date with validation
   */
  parseDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * Get timezone offset in minutes
   */
  getTimezoneOffset(): number {
    return this.now().getTimezoneOffset();
  }

  /**
   * Convert date to UTC
   */
  toUTC(date: Date): Date {
    return new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  }

  /**
   * Convert UTC date to local time
   */
  fromUTC(date: Date): Date {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  }

  // ========== TESTING METHODS ==========

  /**
   * Set mock time for testing
   * @param mockTime - Date to mock, or null to use real time
   */
  setMockTime(mockTime: Date | string | null): void {
    if (mockTime === null) {
      this.mockTime = null;
    } else if (typeof mockTime === 'string') {
      this.mockTime = new Date(mockTime);
    } else {
      this.mockTime = new Date(mockTime);
    }
  }

  /**
   * Clear mock time and use real time
   */
  clearMockTime(): void {
    this.mockTime = null;
  }

  /**
   * Check if time is currently mocked
   */
  isMocked(): boolean {
    return this.mockTime !== null;
  }

  /**
   * Get the current mock time (if set)
   */
  getMockTime(): Date | null {
    return this.mockTime;
  }

  /**
   * Advance mock time by specified milliseconds
   */
  advanceMockTime(milliseconds: number): void {
    if (this.mockTime) {
      this.mockTime = new Date(this.mockTime.getTime() + milliseconds);
    }
  }

  /**
   * Advance mock time by days
   */
  advanceMockTimeByDays(days: number): void {
    this.advanceMockTime(days * 24 * 60 * 60 * 1000);
  }

  /**
   * Advance mock time by hours
   */
  advanceMockTimeByHours(hours: number): void {
    this.advanceMockTime(hours * 60 * 60 * 1000);
  }

  /**
   * Set default timezone
   */
  setDefaultTimezone(timezone: string): void {
    this.defaultTimezone = timezone;
  }

  /**
   * Get default timezone
   */
  getDefaultTimezone(): string {
    return this.defaultTimezone;
  }
}
