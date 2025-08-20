import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { IsValidEmail, IsSecurePassword } from '../../../common/decorators/validation.decorator';

export class CreateUserDto {
  @IsValidEmail('User email', 'user@example.com')
  email: string;

  @IsSecurePassword('User password')
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be one of: USER, ADMIN' })
  role?: Role;
}
