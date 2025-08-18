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
  UseGuards 
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiExtraModels,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { 
  ApiCreatedResponse, 
  ApiSuccessResponse,
  ApiAuthResponses,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiPaginatedResponse
} from '../../common/response/response.decorator';
import { UserRO } from '../../common/dto/user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('User Management')
@ApiExtraModels(UserRO)
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN) // Assuming Role.ADMIN is defined in your Role enum
  @ApiOperation({ summary: 'Membuat pengguna baru' })
  @ApiCreatedResponse('Pengguna berhasil dibuat', UserRO)
  @ApiConflictResponse()
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN) // Assuming Role.ADMIN is defined in your Role enum
  @ApiOperation({ summary: 'Mengambil daftar pengguna dengan paginasi dan filter' })
  @ApiPaginatedResponse('Data pengguna berhasil diambil', UserRO)
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  findAll(@Query() query: GetUsersDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN) // Assuming Role.ADMIN is defined in your Role enum
  @ApiOperation({ summary: 'Mengambil detail pengguna berdasarkan ID' })
  @ApiParam({
    name: 'id',
    description: 'ID unik pengguna',
    example: 'clh123abc456def789'
  })
  @ApiSuccessResponse('Data pengguna berhasil diambil', UserRO)
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN) // Assuming Role.ADMIN is defined in your Role enum
  @ApiOperation({ summary: 'Memperbarui data pengguna' })
  @ApiParam({
    name: 'id',
    description: 'ID unik pengguna',
    example: 'clh123abc456def789'
  })
  @ApiSuccessResponse('Pengguna berhasil diperbarui', UserRO)
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN) // Assuming Role.ADMIN is defined in your Role enum
  @ApiOperation({ summary: 'Menghapus pengguna' })
  @ApiParam({
    name: 'id',
    description: 'ID unik pengguna',
    example: 'clh123abc456def789'
  })
  @ApiSuccessResponse('Pengguna berhasil dihapus')
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiAuthResponses()
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
