import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { 
  ApiSuccessResponse,
  ApiPaginatedResponse,
  ApiCrudResponses 
} from '../../common/response/response.decorator';
import { UserRO } from '../../common/dto/user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@ApiExtraModels(UserRO)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mendapatkan daftar pengguna dengan pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Nomor halaman (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Jumlah item per halaman (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Kata kunci pencarian email' })
  @ApiPaginatedResponse('Daftar pengguna berhasil diambil', UserRO)
  @ApiCrudResponses()
  public async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.userService.findAll(pageNumber, limitNumber, search);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mendapatkan profil pengguna yang sedang login' })
  @ApiSuccessResponse('Profil pengguna berhasil diambil', UserRO)
  @ApiCrudResponses()
  public async getProfile(@CurrentUser() user: any) {
    return this.userService.findOne(user.id);
  }

}