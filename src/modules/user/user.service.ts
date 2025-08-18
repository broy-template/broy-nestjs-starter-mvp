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
import { PaginationInfo } from 'src/common/interfaces';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

}