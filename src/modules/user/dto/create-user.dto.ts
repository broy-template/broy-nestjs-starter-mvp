import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Alamat email pengguna',
  })
  @IsEmail({}, { message: 'Silakan masukkan alamat email yang valid' })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Nama lengkap pengguna',
    required: false,
  })
  @IsString({ message: 'Nama harus berupa string' })
  @IsOptional()
  name?: string;

  @IsEnum(Role, {
    message: 'Role harus berupa salah satu dari: USER, ADMIN',
  })
  @IsOptional()
  role?: Role;

  @ApiProperty({
    example: 'password123',
    description: 'Kata sandi pengguna',
    minLength: 6,
  })
  @IsString({ message: 'Kata sandi harus berupa string' })
  @MinLength(6, { message: 'Kata sandi minimal terdiri dari 6 karakter' })
  password: string;
}
