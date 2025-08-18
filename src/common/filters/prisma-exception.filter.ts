// src/common/filters/prisma-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { ApiStatus, ErrorResponse } from '../interfaces';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let message = exception.message.replace(/\n/g, '');
    let status: number;
    let errorCode: string | undefined;

    // Lihat kode error Prisma dan petakan ke status HTTP yang sesuai
    switch (exception.code) {
      case 'P2002': { // Unique constraint failed
        status = HttpStatus.CONFLICT;
        // Membuat pesan error lebih dinamis
        const field = (exception.meta?.target as string[])?.[0] || 'input';
        errorCode = 'CONFLICT';
        status = HttpStatus.CONFLICT;
        message = `Conflict: ${field.charAt(0).toUpperCase() + field.slice(1)} sudah ada.`;
        break;
      }
      case 'P2025': { // Record to update or delete does not exist
        status = HttpStatus.NOT_FOUND;
        errorCode = 'NOT_FOUND';
        message = 'Data yang ingin dioperasikan tidak ditemukan.';
        break;
      }
      default: {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        errorCode = 'INTERNAL_SERVER_ERROR';
        message = 'Terjadi kesalahan pada server internal.';
        break;
      }
    }

    const errorResponse: ErrorResponse = {
      status: ApiStatus.FAILED,
      message,
      statusCode: status,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}