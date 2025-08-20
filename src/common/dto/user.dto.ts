import { Role, UserStatus } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UserProfileRO {
  @ApiProperty({
    description: 'Profile ID',
    example: 'clh123abc456def789'
  })
  id: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    nullable: true
  })
  firstName?: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    nullable: true
  })
  lastName?: string;

  @ApiProperty({
    description: 'Bio',
    example: 'Software developer with passion for technology',
    nullable: true
  })
  bio?: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: '/files/download/123e4567-e89b-12d3-a456-426614174000',
    nullable: true
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+62812345678',
    nullable: true
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Birth date',
    example: '1990-01-01T00:00:00.000Z',
    nullable: true
  })
  birthDate?: Date;
}

export class UserRO {
  @ApiProperty({
    description: 'User unique ID',
    example: 'clh123abc456def789'
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.USER
  })
  role: Role;

  @ApiProperty({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE
  })
  status: UserStatus;

  @ApiProperty({
    description: 'User profile',
    type: UserProfileRO,
    nullable: true
  })
  profile?: UserProfileRO;

  @ApiProperty({
    description: 'Account creation date',
    example: '2025-08-18T10:30:00.000Z'
  })
  createdAt: Date;
  
  @ApiProperty({
    description: 'Last updated date',
    example: '2025-08-18T10:30:00.000Z'
  })
  updatedAt: Date;
}