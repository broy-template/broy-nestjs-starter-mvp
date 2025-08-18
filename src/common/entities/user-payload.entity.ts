// src/common/entities/user-payload.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserPayload {
  @ApiProperty({ description: 'User ID (UUID)', example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User role', enum: Role, example: Role.USER })
  role: Role;
}