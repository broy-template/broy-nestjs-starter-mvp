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
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import type { Response } from 'express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiStatus, ErrorResponse, Public, SkipResponseTransform } from 'src/common';
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

  constructor(private readonly filesService: FilesService) { }

  @Get('view/public/:subfolder/:filename')
  @Public()
  @ApiOperation({ summary: 'View a public file from a subfolder' })
  @ApiResponse({ status: 200, description: 'File found and displayed.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  async viewPublicFile(
    @Param('subfolder') subfolder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // Kita panggil service yang sama
    const { exists, stream, fileSize, mimeType } = await this.filesService.getFileStream(filename, path.join('public', subfolder));


    if (!exists || !stream) {
      throw new NotFoundException('File not found');
    }


    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', fileSize);
    // Gunakan 'inline' untuk menampilkan file di browser
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    stream.pipe(res);
  }


  @Get('view/private/:subfolder/:filename')
  @ApiOperation({ summary: 'View a private file from a subfolder' })
  @ApiResponse({ status: 200, description: 'File found and displayed.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  async viewPrivateFile(
    @Param('subfolder') subfolder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // Kita panggil service yang sama
    const { exists, stream, fileSize, mimeType } = await this.filesService.getFileStream(filename, path.join('public', subfolder));


    if (!exists || !stream) {
      throw new NotFoundException('File not found');
    }


    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', fileSize);
    // Gunakan 'inline' untuk menampilkan file di browser
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    stream.pipe(res);
  }

}