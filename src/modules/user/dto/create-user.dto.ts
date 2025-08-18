import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { IsValidEmail, IsSecurePassword } from '../../../common/decorators/validation.decorator';

export class CreateUserDto {
  @IsValidEmail('Email pengguna', 'user@example.com')
  email: string;

  @IsSecurePassword('Kata sandi pengguna')
  password: string;

  @ApiProperty({
    description: 'Role pengguna',
    enum: Role,
    example: Role.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Role harus salah satu dari: USER, ADMIN' })
  role?: Role;
}
