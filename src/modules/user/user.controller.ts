import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiExtraModels,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateAvatarDto, UpdateAvatarResponseDto } from './dto/update-avatar.dto';
import {
  ApiCreatedResponse,
  ApiSuccessResponse,
  ApiAuthResponses,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiPaginatedResponse
} from '../../common/response/response.decorator';
import { UserRO, UserProfileRO } from '../../common/dto/user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPayload } from '../../common/entities/user-payload.entity';
import { Role } from '@prisma/client';

@ApiTags('User')
@ApiExtraModels(UserRO, UpdateAvatarResponseDto)
@ApiBearerAuth()
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[ADMIN ONLY] Create new user',
    description: '**[ADMIN ONLY]** Create a new user account. Only administrators can create new users.'
  })
  @ApiCreatedResponse('User created successfully', UserRO)
  @ApiConflictResponse()
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[ADMIN ONLY] Get list of users with pagination and filters',
    description: '**[ADMIN ONLY]** Retrieve paginated list of all users. Only administrators can view all users list.'
  })
  @ApiPaginatedResponse('User data retrieved successfully', UserRO)
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  findAll(@Query() query: GetUsersDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[ADMIN ONLY] Get user details by ID',
    description: '**[ADMIN ONLY]** Retrieve detailed information of a specific user. Only administrators can view user details.'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique user ID',
    example: 'clh123abc456def789'
  })
  @ApiSuccessResponse('User data retrieved successfully', UserRO)
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[ADMIN ONLY] Update user data',
    description: '**[ADMIN ONLY]** Update user profile data including email, role, and status. Only administrators can modify user accounts.'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique user ID',
    example: 'clh123abc456def789'
  })
  @ApiSuccessResponse('User updated successfully', UserRO)
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit for avatars
      files: 1,
    },
    fileFilter: (req, file, cb) => {
      // Only allow image files for avatars
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error(`Avatar must be an image file. Allowed types: ${allowedMimes.join(', ')}`), false);
      }

      cb(null, true);
    },
  }))
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 avatar updates per minute
  @ApiOperation({
    summary: '[OWNER/ADMIN] Update user avatar',
    description: `**[OWNER/ADMIN]** Upload and update user avatar image. 

**Access Control:**
- Users can only update their own avatar
- Administrators can update any user's avatar

**File Requirements:**
- Only image files allowed: JPEG, PNG, GIF, WebP
- Maximum file size: 5MB
- File signature validation (magic bytes check)
- Rate limited: 3 uploads per minute

**Security Features:**
- Automatic cleanup of old avatar files
- UUID-based secure file storage
- Comprehensive audit logging`
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image file',
    type: UpdateAvatarDto,
  })
  @ApiSuccessResponse('Avatar updated successfully', UpdateAvatarResponseDto)
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  async updateAvatar(
    @CurrentUser() currentUser: UserPayload,
  ) {
    
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: '[ADMIN ONLY] Delete user',
    description: '**[ADMIN ONLY]** Permanently delete a user account and all associated data. This action cannot be undone. Only administrators can delete user accounts.'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique user ID',
    example: 'clh123abc456def789'
  })
  @ApiSuccessResponse('User deleted successfully')
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
