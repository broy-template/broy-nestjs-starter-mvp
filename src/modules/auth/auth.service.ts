import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  JwtPayload,
  SuccessResponse,
} from '../../common/interfaces';
import { plainToInstance } from 'class-transformer';
import { UserRO } from 'src/common/dto/user.dto';
import { AuthSessionRO } from './ro/auth-session.ro';
import { TokensRO } from './ro/tokens-ro';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  // Di dalam AuthService
  /**
   * Registrasi user baru
   */
  public async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // 1. Hash password
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Langsung coba buat user baru
    // Buat user baru
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User baru terdaftar: ${newUser.email}`);

    // 3. Buat access token
    // Buat access token
    const { accessToken, refreshToken } = await this.generateTokens({
      email: newUser.email,
      sub: newUser.id,
      role: newUser.role,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: newUser.id }, data: { hashedRefreshToken: hashedRefreshToken } });

    const authSession = plainToInstance(AuthSessionRO, {
      user: plainToInstance(UserRO, newUser),
      accessToken,
      refreshToken: hashedRefreshToken
    });

    return SuccessResponse.single<AuthSessionRO>(authSession, 'Registrasi berhasil');
  }

  /**
   * Login user
   */
  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email atau kata sandi salah');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau kata sandi salah');
    }
    const { accessToken, refreshToken } = await this.generateTokens({
      email: user.email,
      sub: user.id,
      role: user.role,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const userDto = await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        hashedRefreshToken: hashedRefreshToken
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    this.logger.log(`User login: ${user.email}`);
    
    const authSession = plainToInstance(AuthSessionRO, {
      user: plainToInstance(UserRO, userDto),
      accessToken,
      refreshToken: hashedRefreshToken
    });

    return SuccessResponse.single<AuthSessionRO>(authSession, 'Login berhasil');
  }

  /**
   * Refresh token akses
   */
  public async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }
    const { accessToken, refreshToken } = await this.generateTokens({
      email: user.email,
      sub: user.id,
      role: user.role,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { hashedRefreshToken: hashedRefreshToken } });
    this.logger.log(`Token akses diperbarui untuk user: ${user.email}`);
    
    const tokens = plainToInstance(TokensRO, {
      accessToken,
      refreshToken: hashedRefreshToken,
    });

    return SuccessResponse.single<TokensRO>(tokens);
  }

  /**
   * Logout user
   */
  public async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { hashedRefreshToken: null } });
    this.logger.log(`User logout: ${userId}`);
    return SuccessResponse.null('Logout berhasil');
  }

  /**
   * Hapus akun user
   */
  public async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    this.logger.log(`Akun user dihapus: ${userId}`);
    return SuccessResponse.null('Akun berhasil dihapus');
  }

  /**
   * Generate access token dan refresh token
   */
  private async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
