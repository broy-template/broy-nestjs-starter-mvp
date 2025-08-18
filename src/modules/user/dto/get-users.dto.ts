import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';
import { BaseQueryDto } from '../../../common/dto/query.dto';

export class GetUsersDto extends BaseQueryDto {
  @ApiProperty({
    description: 'Filter berdasarkan role',
    enum: Role,
    example: Role.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Role harus salah satu dari: USER, ADMIN' })
  role?: Role;

  @ApiProperty({
    description: 'Filter berdasarkan status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status harus salah satu dari: ACTIVE, INACTIVE, BANNED' })
  status?: UserStatus;
}
