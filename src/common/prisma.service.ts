import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    this.logger.log('🔗 Connecting to database...');
    await this.$connect();
    this.logger.log('✅ Connected to database successfully');
  }

  async onModuleDestroy() {
    this.logger.log('🔌 Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('✅ Disconnected from database successfully');
  }

  async cleanDb() {
    // Helper method untuk testing - menghapus semua data
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof this];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as any).deleteMany();
        }
      }),
    );
  }
}
