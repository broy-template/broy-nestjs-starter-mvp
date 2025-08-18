import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { ApiResponse, ApiStatus, PaginationInfo } from '../../common/interfaces';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<UserEntity>> {
    const { email, password, name } = createUserDto;

    // Cek apakah user sudah ada
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER',
      },
    });

    this.logger.log(`New user created: ${user.email}`);

    return {
      status: ApiStatus.SUCCESS,
      message: 'User created successfully',
      data: new UserEntity(user),
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<UserEntity[]>> {
    const skip = (page - 1) * limit;

    const [users, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const pagination: PaginationInfo = {
      totalItems,
      itemsPerPage: limit,
      currentPage: page,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    };

    return {
      status: ApiStatus.SUCCESS,
      message: 'Users retrieved successfully',
      data: users.map((user) => new UserEntity(user)),
      pagination,
    };
  }

  async findOne(id: string): Promise<ApiResponse<UserEntity>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      status: ApiStatus.SUCCESS,
      message: 'User retrieved successfully',
      data: new UserEntity(user),
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<ApiResponse<UserEntity>> {
    // Cek ownership atau admin role
    if (currentUserId !== id && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own profile');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Jika email diupdate, cek duplikasi
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    // Hash password jika diupdate
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`User updated: ${updatedUser.email}`);

    return {
      status: ApiStatus.SUCCESS,
      message: 'User updated successfully',
      data: new UserEntity(updatedUser),
    };
  }

  async remove(
    id: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<ApiResponse> {
    // Hanya admin yang bisa menghapus user lain
    if (currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('Only admin can delete users');
    }

    // Admin tidak bisa menghapus dirinya sendiri
    if (currentUserId === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.log(`User deleted: ${user.email}`);

    return {
      status: ApiStatus.SUCCESS,
      message: 'User deleted successfully',
    };
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? new UserEntity(user) : null;
  }
}
