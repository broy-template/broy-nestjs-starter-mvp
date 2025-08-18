import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Prisma, Role } from '@prisma/client';
import { createPaginationInfo } from 'src/common/helpers/pagination.helper';
import { PaginationInfo, SuccessResponse } from 'src/common/interfaces';
import { UserRO } from 'src/common/dto/user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Mendapatkan daftar pengguna dengan pagination
   */
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.UserWhereInput = search
      ? {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const usersRO = users.map(user => plainToInstance(UserRO, user));
    const pagination = createPaginationInfo({ 
      page, 
      limit, 
      totalItems: total 
    });

    this.logger.log(`Retrieved ${users.length} users from page ${page}`);
    
    return SuccessResponse.paginated<UserRO>(usersRO, pagination, 'Daftar pengguna berhasil diambil');
  }

  /**
   * Mendapatkan data pengguna berdasarkan ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const userRO = plainToInstance(UserRO, user);
    this.logger.log(`Retrieved user profile: ${user.email}`);
    
    return SuccessResponse.single<UserRO>(userRO, 'Profil pengguna berhasil diambil');
  }

}