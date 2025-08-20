import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload'
  })
  file: Express.Multer.File;
}

export class FileUploadResponseDto {
  @ApiProperty({ example: 'File berhasil diunggah!' })
  message: string;

  @ApiProperty({ example: '/uploads/1724123456789-123456789.jpg' })
  filePath: string;

  @ApiProperty({ example: 'example.jpg' })
  originalName: string;

  @ApiProperty({ example: '1724123456789-123456789.jpg' })
  filename: string;

  @ApiProperty({ example: 1024 })
  size: number;
}

export class FileListItemDto {
  @ApiProperty({ example: '1724123456789-123456789.jpg' })
  filename: string;

  @ApiProperty({ example: 1024 })
  size: number;

  @ApiProperty({ example: '2025-08-20T08:30:00.000Z' })
  uploadedAt: Date;

  @ApiProperty({ example: '/files/download/1724123456789-123456789.jpg' })
  downloadUrl: string;
}

export class FileListResponseDto {
  @ApiProperty({ example: 'List file berhasil diambil!' })
  message: string;

  @ApiProperty({ type: [FileListItemDto] })
  files: FileListItemDto[];
}

export class FileDeleteResponseDto {
  @ApiProperty({ example: 'File berhasil dihapus!' })
  message: string;

  @ApiProperty({ example: '1724123456789-123456789.jpg' })
  filename: string;
}
