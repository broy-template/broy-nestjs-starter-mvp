import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SecureFileUploadService } from '../../common/services/secure-file-upload.service';

@Module({
  controllers: [UserController],
  providers: [UserService, SecureFileUploadService],
  exports: [UserService],
})
export class UserModule {}
