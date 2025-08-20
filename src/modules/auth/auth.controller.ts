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
} from '../../common/response/response.decorator';
import { UserRO } from '../../common/dto/user.dto';
import { AuthSessionRO } from './ro/auth-session.ro';
import { TokensRO } from './ro/tokens.ro';

@ApiTags('Authentication')
@ApiExtraModels(UserRO, AuthSessionRO, TokensRO)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[PUBLIC] Register new user', description: '**[PUBLIC ACCESS]** Register a new user account. No authentication required.' })
  @ApiCreatedResponse('Pengguna berhasil didaftarkan', AuthSessionRO)
  @ApiConflictResponse()
  @ApiAuthResponses()
  public async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[PUBLIC] User login', description: '**[PUBLIC ACCESS]** Authenticate user and receive access tokens. No authentication required.' })
  @ApiSuccessResponse('Login berhasil', AuthSessionRO)
  @ApiUnauthorizedResponse()
  @ApiAuthResponses()
  public async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[AUTHENTICATED] Refresh access token', description: '**[AUTHENTICATED USERS]** Refresh access token using valid refresh token. Requires valid refresh token.' })
  @ApiBearerAuth()
  @ApiSuccessResponse('Token berhasil diperbarui', TokensRO)
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
  @ApiOperation({ summary: '[AUTHENTICATED] User logout', description: '**[AUTHENTICATED USERS]** Logout user and invalidate refresh token. Requires valid access token.' })
  @ApiBearerAuth()
  @ApiSuccessResponse('Logout berhasil')
  @ApiUnauthorizedResponse()
  @ApiAuthResponses()
  public async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[AUTHENTICATED] Delete user account', description: '**[AUTHENTICATED USERS]** Permanently delete own user account. Users can only delete their own account. Requires valid access token.' })
  @ApiBearerAuth()
  @ApiSuccessResponse('Akun berhasil dihapus')
  @ApiUnauthorizedResponse()
  @ApiAuthResponses()
  public async delete(@CurrentUser() user: any) {
    return this.authService.deleteAccount(user.id);
  }

}
