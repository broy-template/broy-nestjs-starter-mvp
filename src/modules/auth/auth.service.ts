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
  ServiceResponse,
} from '../../common/interfaces';
import { plainToInstance } from 'class-transformer';
import { UserDto } from 'src/common/dto/user.dto';
import { AuthSessionDto } from './dto/auth-session.dto';
import { TokensDto } from './dto/tokens-dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  // Di dalam AuthService
  public async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // 1. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Langsung coba buat user baru
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
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`New user registered: ${newUser.email}`);

    // 3. Buat access token
    const { accessToken, refreshToken } = await this.generateTokens({
      email: newUser.email,
      sub: newUser.id,
      role: newUser.role,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: newUser.id }, data: { hashedRefreshToken: hashedRefreshToken } });

    return ServiceResponse.single(plainToInstance(AuthSessionDto, {
      user: plainToInstance(UserDto, newUser),
      accessToken,
      refreshToken: hashedRefreshToken,
    }),
      'Registrasi berhasil'
    );
  }

  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
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
    this.logger.log(`User logged in: ${user.email}`);
    return ServiceResponse.single(plainToInstance(AuthSessionDto, {
      user: plainToInstance(UserDto, userDto),
      accessToken,
      refreshToken,
    }),
      'Login berhasil'
    );
  }

  public async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const { accessToken, refreshToken } = await this.generateTokens({
      email: user.email,
      sub: user.id,
      role: user.role,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { hashedRefreshToken: hashedRefreshToken } });
    this.logger.log(`Access token refreshed for user: ${user.email}`);
    return ServiceResponse.single(plainToInstance(TokensDto, {
      accessToken,
      refreshToken,
    }));
  }

  public async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { hashedRefreshToken: null } });
    this.logger.log(`User logged out: ${userId}`);
    return ServiceResponse.null('Logout berhasil');
  }

  // delete account
  public async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    this.logger.log(`User account deleted: ${userId}`);
    return ServiceResponse.null('Akun berhasil dihapus');
  }

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
