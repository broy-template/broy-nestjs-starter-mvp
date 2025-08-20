import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { SecureFileUploadService } from '../../common/services/secure-file-upload.service';

@Module({
  controllers: [FileController],
  providers: [SecureFileUploadService],
  exports: [SecureFileUploadService],
})
export class FileModule {}
