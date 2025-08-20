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
   * Create new user
   */
  async create(createUserDto: CreateUserDto) {
    const { email, password, role } = createUserDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
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

    this.logOperation('Creating user', `${newUser.email}`);

    const userRO = plainToInstance(UserRO, newUser);
    return SuccessResponse.single<UserRO>(userRO, 'User created successfully');
  }

  /**
   * Get all users with pagination and filters
   */
  async findAll(query: GetUsersDto) {
    // Build additional where conditions for user-specific filters
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
        searchFields: ['email'], // Search by email
      }
    );

    const userROs = result.data.map(user => plainToInstance(UserRO, user));
    
    this.logOperation('Fetching users', `${result.data.length} of ${result.totalItems} total`);

    return SuccessResponse.paginated<UserRO>(userROs, result.pagination, 'User data retrieved successfully');
  }

  /**
   * Get user by ID
   */
  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    if (!this.validateUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
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
      throw new NotFoundException('User not found');
    }

    this.logOperation('Fetching user', user.email);

    const userRO = plainToInstance(UserRO, user);
    return SuccessResponse.single<UserRO>(userRO, 'User data retrieved successfully');
  }

  /**
   * Update user by ID
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    if (!this.validateUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if email is already used by another user
    if (updateUserDto.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          NOT: { id },
        },
      });

      if (emailExists) {
        throw new ConflictException('Email is already used by another user');
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

    this.logOperation('Updating user', updatedUser.email);

    const userRO = plainToInstance(UserRO, updatedUser);
    return SuccessResponse.single<UserRO>(userRO, 'User updated successfully');
  }

  /**
   * Delete user by ID
   */
  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    if (!this.validateUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Delete user (cascade will delete profile as well)
    await this.prisma.user.delete({
      where: { id },
    });

    this.logOperation('Deleting user', existingUser.email);

    return SuccessResponse.deleted('User deleted successfully');
  }
}
