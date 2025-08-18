import { applyDecorators } from '@nestjs/common';
import { IsUUID, IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Decorator untuk validasi UUID dengan Swagger documentation
 */
export function IsValidUUID(description: string = 'ID unik', example: string = 'clh123abc456def789') {
  return applyDecorators(
    ApiProperty({
      description,
      example,
      format: 'uuid',
    }),
    IsUUID('4', { message: 'Format ID tidak valid' })
  );
}

/**
 * Decorator untuk validasi email dengan Swagger documentation
 */
export function IsValidEmail(description: string = 'Alamat email', example: string = 'user@example.com') {
  return applyDecorators(
    ApiProperty({
      description,
      example,
      format: 'email',
    }),
    IsEmail({}, { message: 'Format email tidak valid' })
  );
}

/**
 * Decorator untuk validasi password dengan kriteria keamanan
 */
export function IsSecurePassword(description: string = 'Kata sandi') {
  return applyDecorators(
    ApiProperty({
      description: `${description} (minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka)`,
      example: 'Password123',
      minLength: 8,
    }),
    IsString({ message: 'Kata sandi harus berupa string' }),
    MinLength(8, { message: 'Kata sandi minimal 8 karakter' }),
    Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      {
        message: 'Kata sandi harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka',
      }
    )
  );
}

/**
 * Decorator untuk validasi nama dengan batasan karakter
 */
export function IsValidName(description: string = 'Nama', maxLength: number = 50) {
  return applyDecorators(
    ApiProperty({
      description,
      example: 'John Doe',
      maxLength,
    }),
    IsString({ message: `${description} harus berupa string` }),
    MaxLength(maxLength, { message: `${description} maksimal ${maxLength} karakter` }),
    Matches(/^[a-zA-Z\s]+$/, { message: `${description} hanya boleh mengandung huruf dan spasi` })
  );
}

/**
 * Decorator untuk validasi nomor telepon Indonesia
 */
export function IsIndonesianPhoneNumber(description: string = 'Nomor telepon') {
  return applyDecorators(
    ApiProperty({
      description: `${description} (format Indonesia: +62xxx atau 08xxx)`,
      example: '+6281234567890',
    }),
    IsString({ message: `${description} harus berupa string` }),
    Matches(
      /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      {
        message: `${description} harus menggunakan format Indonesia yang valid`,
      }
    )
  );
}
