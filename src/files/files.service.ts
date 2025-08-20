import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { join } from 'path';
import { createReadStream, existsSync, readdirSync, unlinkSync, statSync } from 'fs';
import { ApiResponse, ApiStatus } from 'src/common/interfaces';
import {
  FileUploadResponseDto,
  FileListResponseDto,
  FileDeleteResponseDto,
  FileListItemDto
} from './dto/file-upload.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadsPath = join(process.cwd(), 'uploads');

  async uploadFile(file: Express.Multer.File): Promise<ApiResponse<FileUploadResponseDto>> {
    try {
      this.logger.log(`File uploaded: ${file.originalname} -> ${file.filename}`);
      
      const responseData: FileUploadResponseDto = {
        message: 'File berhasil diunggah!',
        filePath: `/uploads/${file.filename}`,
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
      };

      return {
        status: ApiStatus.SUCCESS,
        message: 'File berhasil diunggah!',
        data: responseData,
      };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw new HttpException('Error saat mengunggah file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFileStream(filename: string): Promise<{ stream: NodeJS.ReadableStream | null; exists: boolean }> {
    try {
      // Validasi filename untuk keamanan (mencegah path traversal)
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new HttpException('Invalid filename', HttpStatus.BAD_REQUEST);
      }

      const filePath = join(this.uploadsPath, filename);
      
      // Cek apakah file ada
      if (!existsSync(filePath)) {
        return { stream: null, exists: false };
      }

      // Stream file
      const fileStream = createReadStream(filePath);
      
      this.logger.log(`File streamed: ${filename}`);
      return { stream: fileStream, exists: true };
    } catch (error) {
      this.logger.error(`Error streaming file: ${error.message}`);
      throw new HttpException('Error saat mendownload file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async listFiles(): Promise<ApiResponse<FileListResponseDto>> {
    try {
      // Cek apakah folder uploads ada
      if (!existsSync(this.uploadsPath)) {
        return {
          status: ApiStatus.SUCCESS,
          message: 'Folder uploads tidak ditemukan',
          data: {
            message: 'Folder uploads tidak ditemukan',
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
        message: 'List file berhasil diambil!',
        data: {
          message: 'List file berhasil diambil!',
          files
        }
      };
    } catch (error) {
      this.logger.error(`Error listing files: ${error.message}`);
      throw new HttpException('Error saat mengambil list file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteFile(filename: string): Promise<ApiResponse<FileDeleteResponseDto>> {
    try {
      // Validasi filename untuk keamanan
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new HttpException('Invalid filename', HttpStatus.BAD_REQUEST);
      }

      const filePath = join(this.uploadsPath, filename);
      
      // Cek apakah file ada
      if (!existsSync(filePath)) {
        throw new HttpException('File tidak ditemukan', HttpStatus.NOT_FOUND);
      }

      // Hapus file
      unlinkSync(filePath);

      this.logger.log(`File deleted: ${filename}`);
      
      return {
        status: ApiStatus.SUCCESS,
        message: 'File berhasil dihapus!',
        data: {
          message: 'File berhasil dihapus!',
          filename
        }
      };
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error saat menghapus file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
