import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtRefreshAuthGuard } from '../../common/guards/jwt-refresh-auth.guard';
import { 
  ApiCreatedResponse, 
  ApiSuccessResponse,
  ApiAuthResponses,
  ApiConflictResponse,
  ApiUnauthorizedResponse
} from '../../common/interfaces';
import { UserRO } from '../../common/dto/user.dto';
import { AuthSessionRO } from './ro/auth-session.ro';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrasi pengguna baru' })
  @ApiCreatedResponse('Pengguna berhasil didaftarkan')
  @ApiConflictResponse()
  @ApiAuthResponses()
  public async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login pengguna' })
  @ApiSuccessResponse('Login berhasil')
  @ApiUnauthorizedResponse()
  @ApiAuthResponses()
  public async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token akses' })
  @ApiBearerAuth()
  @ApiSuccessResponse('Token berhasil diperbarui')
  @ApiUnauthorizedResponse()
  @ApiAuthResponses()
  public async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @CurrentUser() user: any,
  ) {
    return this.authService.refreshToken(user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout pengguna' })
  @ApiBearerAuth()
  @ApiSuccessResponse('Logout berhasil')
  @ApiUnauthorizedResponse()
  @ApiAuthResponses()
  public async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus akun pengguna' })
  @ApiBearerAuth()
  @ApiSuccessResponse('Akun berhasil dihapus')
  @ApiUnauthorizedResponse()
  @ApiAuthResponses()
  public async delete(@CurrentUser() user: any) {
    return this.authService.deleteAccount(user.id);
  }

}
