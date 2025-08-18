import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { PrismaService } from '../../common/prisma.service';
import { BaseService } from '../../common/services/base.service';
import { SuccessResponse } from '../../common/interfaces';
import { UserRO } from '../../common/dto/user.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma, UserService.name);
  }

  /**
   * Membuat user baru
   */
  async create(createUserDto: CreateUserDto) {
    const { email, password, role } = createUserDto;

    // Cek apakah email sudah ada
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'USER',
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

    this.logOperation('Membuat user', `${newUser.email}`);

    const userRO = plainToInstance(UserRO, newUser);
    return SuccessResponse.single<UserRO>(userRO, 'User berhasil dibuat');
  }

  /**
   * Mengambil semua user dengan paginasi dan filter
   */
  async findAll(query: GetUsersDto) {
    // Build additional where conditions untuk user-specific filters
    const additionalWhere: any = {};

    if (query.role) {
      additionalWhere.role = query.role;
    }

    if (query.status) {
      additionalWhere.status = query.status;
    }

    const result = await this.findWithPagination(
      this.prisma.user,
      query,
      {
        where: additionalWhere,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        searchFields: ['email'], // Pencarian berdasarkan email
      }
    );

    const userROs = result.data.map(user => plainToInstance(UserRO, user));
    
    this.logOperation('Mengambil users', `${result.data.length} dari ${result.totalItems} total`);

    return SuccessResponse.paginated<UserRO>(userROs, result.pagination, 'Data user berhasil diambil');
  }

  /**
   * Mengambil user berdasarkan ID
   */
  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('ID user harus diisi');
    }

    if (!this.validateUUID(id)) {
      throw new BadRequestException('Format ID user tidak valid');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            avatarUrl: true,
            phoneNumber: true,
            birthDate: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    this.logOperation('Mengambil user', user.email);

    const userRO = plainToInstance(UserRO, user);
    return SuccessResponse.single<UserRO>(userRO, 'Data user berhasil diambil');
  }

  /**
   * Update user berdasarkan ID
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!id) {
      throw new BadRequestException('ID user harus diisi');
    }

    if (!this.validateUUID(id)) {
      throw new BadRequestException('Format ID user tidak valid');
    }

    // Cek apakah user ada
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Cek apakah email sudah digunakan user lain
    if (updateUserDto.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          NOT: { id },
        },
      });

      if (emailExists) {
        throw new ConflictException('Email sudah digunakan user lain');
      }
    }

    // Prepare update data
    const updateData: any = {
      ...(updateUserDto.email && { email: updateUserDto.email }),
      ...(updateUserDto.role && { role: updateUserDto.role }),
      ...(updateUserDto.status && { status: updateUserDto.status }),
    };

    // Hash password jika ada
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logOperation('Update user', updatedUser.email);

    const userRO = plainToInstance(UserRO, updatedUser);
    return SuccessResponse.single<UserRO>(userRO, 'User berhasil diupdate');
  }

  /**
   * Hapus user berdasarkan ID
   */
  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('ID user harus diisi');
    }

    if (!this.validateUUID(id)) {
      throw new BadRequestException('Format ID user tidak valid');
    }

    // Cek apakah user ada
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Hapus user (cascade akan menghapus profile juga)
    await this.prisma.user.delete({
      where: { id },
    });

    this.logOperation('Hapus user', existingUser.email);

    return SuccessResponse.deleted('User berhasil dihapus');
  }
}
