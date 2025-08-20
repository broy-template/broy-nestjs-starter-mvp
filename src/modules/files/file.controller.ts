import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Query,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SecureFileUploadService, type SecureMulterFile } from '../../common/services/secure-file-upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPayload } from '../../common/entities/user-payload.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Files')
@Controller('files')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(private readonly secureFileService: SecureFileUploadService) {}

  @Post('upload')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB - will be validated again in service
      files: 1,
    },
    fileFilter: (req, file, cb) => {
      // Basic filter - detailed validation in service
      const allowedMimes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/zip'
      ];
      
      if (!allowedMimes.includes(file.mimetype)) {
        return cb(new BadRequestException(`File type ${file.mimetype} not allowed`), false);
      }
      
      cb(null, true);
    },
  }))
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 uploads per minute
  @ApiOperation({ 
    summary: '[AUTHENTICATED] Upload a file securely',
    description: '**[AUTHENTICATED USERS]** Upload a file with comprehensive security validation including file signature verification, antivirus scanning, and metadata stripping. All authenticated users can upload files.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            fileId: { type: 'string' },
            filename: { type: 'string' },
            originalName: { type: 'string' },
            mimetype: { type: 'string' },
            size: { type: 'number' },
            uploadedAt: { type: 'string' },
            checksum: { type: 'string' },
            scanResult: { type: 'string', enum: ['clean', 'infected', 'error'] }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file or validation failed'
  })
  @ApiResponse({
    status: 413,
    description: 'File too large'
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limited'
  })
  async uploadFile(
    @UploadedFile() file: SecureMulterFile,
    @CurrentUser() user: UserPayload,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    this.logger.log(`Upload attempt by user ${user.id}`, {
      userId: user.id,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    try {
      const result = await this.secureFileService.uploadFile(file, user.id);
      
      return {
        success: true,
        message: 'File uploaded successfully',
        data: {
          fileId: result.fileId,
          filename: result.filename,
          originalName: result.originalName,
          mimetype: result.mimetype,
          size: result.size,
          uploadedAt: result.uploadedAt,
          checksum: result.checksum,
          scanResult: result.scanResult || 'pending'
        }
      };
    } catch (error) {
      this.logger.error(`Upload failed for user ${user.id}`, {
        userId: user.id,
        filename: file.originalname,
        error: error.message
      });
      throw error;
    }
  }

  @Get('download/:fileId')
  @Public()
  @ApiOperation({ 
    summary: '[PUBLIC] Download a file by ID',
    description: '**[PUBLIC ACCESS]** Download a file using its secure ID. This endpoint is public but files have non-guessable UUIDs for security. No authentication required.'
  })
  @ApiParam({
    name: 'fileId',
    description: 'Unique file identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({
    name: 'download',
    required: false,
    description: 'Force download (attachment) instead of inline display',
    type: 'boolean'
  })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'File not found'
  })
  async downloadFile(
    @Param('fileId') fileId: string,
    @Query('download') forceDownload: boolean = false,
    @Res() res: Response
  ) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(fileId)) {
      throw new BadRequestException('Invalid file ID format');
    }

    try {
      const { stream, metadata } = await this.secureFileService.getFileStream(fileId);

      // Set security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Content-Type', metadata.mimetype);
      res.setHeader('Content-Length', metadata.size);

      // Cache control
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('ETag', `"${metadata.checksum}"`);

      // Content disposition
      const disposition = forceDownload || !metadata.mimetype.startsWith('image/') 
        ? 'attachment' 
        : 'inline';
      res.setHeader('Content-Disposition', `${disposition}; filename="${metadata.originalName}"`);

      // Log access
      this.logger.log(`File download`, {
        fileId,
        filename: metadata.filename,
        downloadCount: metadata.downloadCount,
        mimetype: metadata.mimetype
      });

      // Stream file
      stream.pipe(res);
    } catch (error) {
      this.logger.warn(`Download failed for file ${fileId}`, {
        fileId,
        error: error.message
      });
      throw error;
    }
  }

  @Get('info/:fileId')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '[AUTHENTICATED] Get file metadata',
    description: '**[AUTHENTICATED USERS]** Retrieve detailed information about an uploaded file. All authenticated users can view file metadata.'
  })
  @ApiParam({
    name: 'fileId',
    description: 'Unique file identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'File information retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'File not found'
  })
  async getFileInfo(
    @Param('fileId') fileId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const metadata = this.secureFileService.getFileMetadata(fileId);
    
    if (!metadata) {
      throw new NotFoundException('File not found');
    }

    this.logger.log(`File info requested`, {
      fileId,
      userId: user.id,
      filename: metadata.filename
    });

    return {
      success: true,
      message: 'File information retrieved successfully',
      data: {
        fileId: metadata.fileId,
        filename: metadata.filename,
        originalName: metadata.originalName,
        mimetype: metadata.mimetype,
        size: metadata.size,
        uploadedBy: metadata.uploadedBy,
        uploadedAt: metadata.uploadedAt,
        downloadCount: metadata.downloadCount,
        lastAccessed: metadata.lastAccessed,
        checksum: metadata.checksum,
        isScanned: metadata.isScanned,
        scanResult: metadata.scanResult,
        tags: metadata.tags
      }
    };
  }

  @Delete(':fileId')
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 deletes per minute
  @ApiOperation({ 
    summary: '[OWNER ONLY] Delete a file',
    description: '**[OWNER ONLY]** Permanently delete a file. Only the uploader can delete their own files. File ownership is verified before deletion.'
  })
  @ApiParam({
    name: 'fileId',
    description: 'Unique file identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'File not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - can only delete own files'
  })
  async deleteFile(
    @Param('fileId') fileId: string,
    @CurrentUser() user: UserPayload,
  ) {
    this.logger.log(`Delete attempt`, {
      fileId,
      userId: user.id
    });

    try {
      await this.secureFileService.deleteFile(fileId, user.id);
      
      return {
        success: true,
        message: 'File deleted successfully',
        data: {
          fileId,
          deletedBy: user.id,
          deletedAt: new Date()
        }
      };
    } catch (error) {
      this.logger.error(`Delete failed`, {
        fileId,
        userId: user.id,
        error: error.message
      });
      throw error;
    }
  }

  // Legacy endpoint compatibility (from your original simple implementation)
  @Get(':filename')
  @Public()
  @ApiOperation({ 
    summary: '[PUBLIC] [DEPRECATED] Download file by filename',
    description: '**[PUBLIC ACCESS]** Legacy endpoint for backward compatibility. Use /download/:fileId instead. No authentication required.'
  })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    // Extract UUID from filename if it follows the pattern
    const uuidMatch = filename.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i);
    
    if (uuidMatch) {
      const fileId = uuidMatch[1];
      return this.downloadFile(fileId, false, res);
    }

    throw new NotFoundException('File not found or invalid filename format');
  }
}
