import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { join } from 'path';
import { createReadStream, existsSync, readdirSync, unlinkSync, statSync } from 'fs';
import { ApiResponse, ApiStatus, SuccessResponse } from 'src/common/interfaces';
import {
  FileUploadResponseDto,
  FileListResponseDto,
  FileDeleteResponseDto,
  FileListItemDto
} from './dto/file-upload.dto';
import { plainToInstance } from 'class-transformer';
import { lookup as getType } from 'mime-types'; // <-- Import library mime-types

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadsPath = join(process.cwd(), 'uploads');

  async uploadFile(file: Express.Multer.File): Promise<ApiResponse<FileUploadResponseDto>> {
    try {
      this.logger.log(`File uploaded: ${file.originalname} -> ${file.filename}`);

      const responseData: FileUploadResponseDto = {
        message: 'File uploaded successfully!',
        filePath: `/${file.path.replace(/\\/g, '/')}`, // Normalize path for URL
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
      };

      return SuccessResponse.single(
        plainToInstance(
          FileUploadResponseDto,
          responseData
        ),
        'File uploaded successfully!'
      );
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw new HttpException('Error while uploading file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFileStream(filename: string, subfolder: string = ''): Promise<{ stream: NodeJS.ReadableStream | null; exists: boolean; fileSize: number, mimeType: string }> {
    try {
      // Validate filename for security (prevent path traversal)
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new HttpException('Invalid filename', HttpStatus.BAD_REQUEST);
      }

      const filePath = join(this.uploadsPath, subfolder, filename);

      // Check if file exists
      if (!existsSync(filePath)) {
        return { stream: null, exists: false, fileSize: 0, mimeType: '' };
      }
      const mimeType = getType(filePath) || 'application/octet-stream';
      
      const stat = statSync(filePath);
      const fileSize = stat.size; // <- File size in bytes

      // Stream file
      const fileStream = createReadStream(filePath);

      this.logger.log(`File streamed: ${filename}`);
      return { stream: fileStream, exists: true, fileSize, mimeType };
    } catch (error) {
      this.logger.error(`Error streaming file: ${error.message}`);
      throw new HttpException('Error while downloading file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async listFiles(): Promise<ApiResponse<FileListResponseDto>> {
    try {
      // Check if uploads folder exists
      if (!existsSync(this.uploadsPath)) {
        return {
          status: ApiStatus.SUCCESS,
          message: 'Uploads folder not found',
          data: {
            message: 'Uploads folder not found',
            files: []
          }
        };
      }

      const files: FileListItemDto[] = readdirSync(this.uploadsPath).map(filename => {
        const filePath = join(this.uploadsPath, filename);
        const stats = statSync(filePath);

        return {
          filename,
          size: stats.size,
          uploadedAt: stats.birthtime,
          downloadUrl: `/files/download/${filename}`
        };
      });

      this.logger.log(`Listed ${files.length} files`);

      return {
        status: ApiStatus.SUCCESS,
        message: 'File list retrieved successfully!',
        data: {
          message: 'File list retrieved successfully!',
          files
        }
      };
    } catch (error) {
      this.logger.error(`Error listing files: ${error.message}`);
      throw new HttpException('Error while retrieving file list', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteFile(filename: string): Promise<ApiResponse<FileDeleteResponseDto>> {
    try {
      // Validate filename for security
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new HttpException('Invalid filename', HttpStatus.BAD_REQUEST);
      }

      const filePath = join(this.uploadsPath, filename);

      // Check if file exists
      if (!existsSync(filePath)) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      // Delete file
      unlinkSync(filePath);

      this.logger.log(`File deleted: ${filename}`);

      return {
        status: ApiStatus.SUCCESS,
        message: 'File deleted successfully!',
        data: {
          message: 'File deleted successfully!',
          filename
        }
      };
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error while deleting file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
