import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse as SwaggerApiResponse, getSchemaPath } from '@nestjs/swagger';

// Response decorator untuk Swagger documentation
export const ApiResponseDecorator = <TModel extends Type<any>>(
  status: number,
  description: string,
  model?: TModel,
  isArray: boolean = false
) => {
  const responseSchema = {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success', 'failed'],
        description: 'Status operasi'
      },
      message: {
        type: 'string',
        description: 'Pesan response'
      },
      ...(model && {
        data: isArray
          ? {
              type: 'array',
              items: { $ref: getSchemaPath(model) },
              description: 'Array data response'
            }
          : { 
              $ref: getSchemaPath(model),
              description: 'Data response'
            },
      }),
      ...(isArray && {
        pagination: {
          type: 'object',
          properties: {
            totalItems: { type: 'number', description: 'Total item' },
            itemsPerPage: { type: 'number', description: 'Item per halaman' },
            currentPage: { type: 'number', description: 'Halaman saat ini' },
            totalPages: { type: 'number', description: 'Total halaman' },
            nextPage: { type: 'number', nullable: true, description: 'Halaman selanjutnya' },
            previousPage: { type: 'number', nullable: true, description: 'Halaman sebelumnya' },
          },
          description: 'Informasi pagination'
        },
      }),
    },
  };

  return applyDecorators(
    SwaggerApiResponse({
      status,
      description,
      schema: responseSchema,
    })
  );
};

// Pre-defined decorators for common responses
export const ApiSuccessResponse = <TModel extends Type<any>>(
  description: string = 'Operation successful',
  model?: TModel
) => ApiResponseDecorator(200, description, model);

export const ApiCreatedResponse = <TModel extends Type<any>>(
  description: string = 'Resource created successfully',
  model?: TModel
) => ApiResponseDecorator(201, description, model);

export const ApiUpdatedResponse = <TModel extends Type<any>>(
  description: string = 'Resource updated successfully',
  model?: TModel
) => ApiResponseDecorator(200, description, model);

export const ApiDeletedResponse = () =>
  ApiResponseDecorator(200, 'Resource deleted successfully');

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  description: string = 'Paginated data retrieved successfully',
  model?: TModel
) => ApiResponseDecorator(200, description, model, true);

export const ApiBadRequestResponse = () =>
  SwaggerApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['failed'], description: 'Status operasi' },
        message: { type: 'string', description: 'Pesan error' },
        statusCode: { type: 'number', example: 400, description: 'Kode status HTTP' },
        errorCode: { type: 'string', description: 'Kode error spesifik', nullable: true },
        timestamp: { type: 'string', format: 'date-time', description: 'Waktu error terjadi' },
        path: { type: 'string', description: 'Path endpoint yang error' },
      },
    },
  });

export const ApiUnauthorizedResponse = () =>
  SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized access',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['failed'], description: 'Status operasi' },
        message: { type: 'string', example: 'Unauthorized access', description: 'Pesan error' },
        statusCode: { type: 'number', example: 401, description: 'Kode status HTTP' },
        errorCode: { type: 'string', description: 'Kode error spesifik', nullable: true },
        timestamp: { type: 'string', format: 'date-time', description: 'Waktu error terjadi' },
        path: { type: 'string', description: 'Path endpoint yang error' },
      },
    },
  });

export const ApiForbiddenResponse = () =>
  SwaggerApiResponse({
    status: 403,
    description: 'Access forbidden',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['failed'], description: 'Status operasi' },
        message: { type: 'string', example: 'Access forbidden', description: 'Pesan error' },
        statusCode: { type: 'number', example: 403, description: 'Kode status HTTP' },
        errorCode: { type: 'string', description: 'Kode error spesifik', nullable: true },
        timestamp: { type: 'string', format: 'date-time', description: 'Waktu error terjadi' },
        path: { type: 'string', description: 'Path endpoint yang error' },
      },
    },
  });

export const ApiNotFoundResponse = () =>
  SwaggerApiResponse({
    status: 404,
    description: 'Resource not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['failed'], description: 'Status operasi' },
        message: { type: 'string', example: 'Resource not found', description: 'Pesan error' },
        statusCode: { type: 'number', example: 404, description: 'Kode status HTTP' },
        errorCode: { type: 'string', description: 'Kode error spesifik', nullable: true },
        timestamp: { type: 'string', format: 'date-time', description: 'Waktu error terjadi' },
        path: { type: 'string', description: 'Path endpoint yang error' },
      },
    },
  });

export const ApiConflictResponse = () =>
  SwaggerApiResponse({
    status: 409,
    description: 'Resource conflict',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['failed'], description: 'Status operasi' },
        message: { type: 'string', example: 'Resource conflict', description: 'Pesan error' },
        statusCode: { type: 'number', example: 409, description: 'Kode status HTTP' },
        errorCode: { type: 'string', description: 'Kode error spesifik', nullable: true },
        timestamp: { type: 'string', format: 'date-time', description: 'Waktu error terjadi' },
        path: { type: 'string', description: 'Path endpoint yang error' },
      },
    },
  });

export const ApiValidationResponse = () =>
  SwaggerApiResponse({
    status: 422,
    description: 'Validation failed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['failed'], description: 'Status operasi' },
        message: { type: 'string', example: 'Validation failed', description: 'Pesan error' },
        statusCode: { type: 'number', example: 422, description: 'Kode status HTTP' },
        errorCode: { type: 'string', description: 'Kode error spesifik', nullable: true },
        timestamp: { type: 'string', format: 'date-time', description: 'Waktu error terjadi' },
        path: { type: 'string', description: 'Path endpoint yang error' },
      },
    },
  });

export const ApiInternalServerErrorResponse = () =>
  SwaggerApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['failed'], description: 'Status operasi' },
        message: { type: 'string', example: 'Internal server error', description: 'Pesan error' },
        statusCode: { type: 'number', example: 500, description: 'Kode status HTTP' },
        errorCode: { type: 'string', description: 'Kode error spesifik', nullable: true },
        timestamp: { type: 'string', format: 'date-time', description: 'Waktu error terjadi' },
        path: { type: 'string', description: 'Path endpoint yang error' },
      },
    },
  });

// Combined decorator for common CRUD operations
export const ApiCrudResponses = () =>
  applyDecorators(
    ApiBadRequestResponse(),
    ApiUnauthorizedResponse(),
    ApiForbiddenResponse(),
    ApiNotFoundResponse(),
    ApiInternalServerErrorResponse()
  );

// Combined decorator for authentication endpoints
export const ApiAuthResponses = () =>
  applyDecorators(
    ApiBadRequestResponse(),
    ApiUnauthorizedResponse(),
    ApiConflictResponse(),
    ApiValidationResponse(),
    ApiInternalServerErrorResponse()
  );
