import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BaseQueryDto } from '../dto/query.dto';
import { createPaginationInfo } from '../helpers/pagination.helper';

export abstract class BaseService {
  protected readonly logger: Logger;

  constructor(
    protected prisma: PrismaService,
    loggerContext?: string
  ) {
    this.logger = new Logger(loggerContext || this.constructor.name);
  }

  /**
   * Helper untuk pagination dan search umum
   */
  protected async findWithPagination<T>(
    model: any,
    query: BaseQueryDto,
    options: {
      where?: any;
      select?: any;
      include?: any;
      orderBy?: any;
      searchFields?: string[];
    } = {}
  ) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    let where = options.where || {};

    // Add search functionality
    if (query.search && options.searchFields && options.searchFields.length > 0) {
      const searchConditions = options.searchFields.map(field => ({
        [field]: {
          contains: query.search,
          mode: 'insensitive',
        },
      }));

      where = {
        ...where,
        OR: searchConditions,
      };
    }

    // Get total count untuk pagination
    const totalItems = await model.count({ where });

    // Get data dengan pagination
    const data = await model.findMany({
      where,
      ...(options.select && { select: options.select }),
      ...(options.include && { include: options.include }),
      skip,
      take: limit,
      orderBy: options.orderBy || { createdAt: 'desc' },
    });

    const pagination = createPaginationInfo({ totalItems, page, limit });

    return { data, pagination, totalItems };
  }

  /**
   * Helper untuk validasi UUID
   */
  protected validateUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Helper untuk log operasi
   */
  protected logOperation(operation: string, details: string) {
    this.logger.log(`${operation}: ${details}`);
  }

  /**
   * Helper untuk log error
   */
  protected logError(operation: string, error: any) {
    this.logger.error(`${operation} gagal: ${error.message}`);
  }
}
