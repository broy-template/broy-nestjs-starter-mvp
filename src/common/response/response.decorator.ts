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
        enum: ['success', 'failed', 'error'],
      },
      message: {
        type: 'string',
      },
      statusCode: {
        type: 'number',
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
      },
      path: {
        type: 'string',
      },
      ...(model && {
        data: isArray
          ? {
              type: 'array',
              items: { $ref: getSchemaPath(model) },
            }
          : { $ref: getSchemaPath(model) },
      }),
      ...(isArray && {
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
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
        status: { type: 'string', enum: ['failed'] },
        message: { type: 'string' },
        statusCode: { type: 'number', example: 400 },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string' },
              message: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
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
        status: { type: 'string', enum: ['failed'] },
        message: { type: 'string', example: 'Unauthorized access' },
        statusCode: { type: 'number', example: 401 },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string' },
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
        status: { type: 'string', enum: ['failed'] },
        message: { type: 'string', example: 'Access forbidden' },
        statusCode: { type: 'number', example: 403 },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string' },
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
        status: { type: 'string', enum: ['failed'] },
        message: { type: 'string', example: 'Resource not found' },
        statusCode: { type: 'number', example: 404 },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string' },
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
        status: { type: 'string', enum: ['failed'] },
        message: { type: 'string', example: 'Resource conflict' },
        statusCode: { type: 'number', example: 409 },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string' },
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
        status: { type: 'string', enum: ['failed'] },
        message: { type: 'string', example: 'Validation failed' },
        statusCode: { type: 'number', example: 422 },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string' },
              message: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
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
        status: { type: 'string', enum: ['error'] },
        message: { type: 'string', example: 'Internal server error' },
        statusCode: { type: 'number', example: 500 },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string' },
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
