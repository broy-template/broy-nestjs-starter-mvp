import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';
import { BaseQueryDto } from '../../../common/dto/query.dto';

export class GetUsersDto extends BaseQueryDto {
  @ApiProperty({
    description: 'Filter by role',
    enum: Role,
    example: Role.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be one of: USER, ADMIN' })
  role?: Role;

  @ApiProperty({
    description: 'Filter by status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be one of: ACTIVE, INACTIVE, BANNED' })
  status?: UserStatus;
}
