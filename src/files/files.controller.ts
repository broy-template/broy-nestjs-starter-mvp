import {
  Controller,
  Logger,
  Post,
  Get,
  Delete,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public, SkipResponseTransform } from 'src/common';
import { FilesService } from './files.service';
import { 
  FileUploadDto, 
  FileUploadResponseDto, 
  FileListResponseDto, 
  FileDeleteResponseDto 
} from './dto/file-upload.dto';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly filesService: FilesService) {}
  
  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @Public()
  @ApiResponse({ status: 201, description: 'File berhasil diunggah!', type: FileUploadResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Tentukan folder penyimpanan
        filename: (req, file, callback) => {
          // Buat nama file yang unik
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.filesService.uploadFile(file);
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Download a file' })
  @ApiResponse({ status: 200, description: 'File berhasil didownload!' })
  @ApiResponse({ status: 404, description: 'File tidak ditemukan!' })
  @Public()
  @SkipResponseTransform()
  async downloadFile(@Param('filename') filename: string, @Res({ passthrough: false }) res: Response) {
    const { stream, exists } = await this.filesService.getFileStream(filename);
    
    if (!exists || !stream) {
      res.status(404).json({
        status: 'failed',
        message: 'File tidak ditemukan',
        statusCode: 404
      });
      return;
    }

    // Set headers untuk download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream file ke response
    stream.pipe(res);
  }

  @Get('list')
  @ApiOperation({ summary: 'List all uploaded files' })
  @ApiResponse({ status: 200, description: 'List file berhasil diambil!', type: FileListResponseDto })
  @Public()
  async listFiles() {
    return await this.filesService.listFiles();
  }

  @Delete('delete/:filename')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File berhasil dihapus!', type: FileDeleteResponseDto })
  @ApiResponse({ status: 404, description: 'File tidak ditemukan!' })
  @Public()
  async deleteFile(@Param('filename') filename: string) {
    return await this.filesService.deleteFile(filename);
  }
}