import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvatarDto {
  @ApiProperty({
    description: 'Avatar image file',
    type: 'string',
    format: 'binary',
    example: 'avatar.jpg'
  })
  avatar: any;
}

export class UpdateAvatarResponseDto {
  @ApiProperty({
    description: 'File ID of uploaded avatar',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  fileId: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://yourapp.com/files/download/123e4567-e89b-12d3-a456-426614174000'
  })
  avatarUrl: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'avatar.jpg'
  })
  originalName: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024576
  })
  size: number;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2024-01-01T12:00:00.000Z'
  })
  uploadedAt: Date;
}
