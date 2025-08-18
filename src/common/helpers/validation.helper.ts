import { BadRequestException } from '@nestjs/common';

export class ValidationHelper {
  /**
   * Validasi UUID format
   */
  static validateUUID(id: string, fieldName: string = 'ID'): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException(`Format ${fieldName} tidak valid`);
    }
  }

  /**
   * Validasi email format (tambahan untuk runtime validation)
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validasi password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password minimal 8 karakter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password harus mengandung huruf besar');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password harus mengandung huruf kecil');
    }

    if (!/\d/.test(password)) {
      errors.push('Password harus mengandung angka');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize string untuk mencegah injection
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>\"'%;()&+]/g, '');
  }

  /**
   * Validasi pagination parameters
   */
  static validatePagination(page?: string, limit?: string): {
    page: number;
    limit: number;
    skip: number;
  } {
    const validatedPage = Math.max(1, parseInt(page || '1') || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit || '10') || 10));
    const skip = (validatedPage - 1) * validatedLimit;

    return {
      page: validatedPage,
      limit: validatedLimit,
      skip,
    };
  }
}
