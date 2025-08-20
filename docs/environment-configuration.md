# Environment Configuration Guide

This document explains all the environment variables used in the Broy NestJS Starter MVP project.

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` according to your environment needs.

## Configuration Sections

### Application Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Application environment | `development` | Yes |
| `PORT` | Server port | `3000` | Yes |
| `API_PREFIX` | API route prefix | `api/v1` | Yes |
| `APP_NAME` | Application name | `"Broy NestJS Starter MVP"` | No |
| `APP_VERSION` | Application version | `"1.0.0"` | No |
| `APP_DESCRIPTION` | Application description | `"NestJS Starter for MVP Development"` | No |
| `APP_TIMEZONE` | Application timezone | `UTC` | No |

### Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `DB_POOL_MIN` | Minimum database connections | `2` | No |
| `DB_POOL_MAX` | Maximum database connections | `10` | No |

#### Database URL Format
```
postgresql://username:password@host:port/database?schema=public
```

### Security Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | JWT signing secret (min 32 chars) | - | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret (min 32 chars) | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration | `15m` | No |
| `JWT_REFRESH_EXPIRES_IN` | JWT refresh token expiration | `7d` | No |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` | No |

**Important:** Change JWT secrets in production! Use long, random strings (minimum 32 characters).

### Server Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | - | No |
| `CORS_METHODS` | Allowed HTTP methods | `GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS` | No |
| `CORS_CREDENTIALS` | Allow credentials in CORS | `true` | No |
| `THROTTLE_TTL` | Rate limit window (seconds) | `60` | No |
| `THROTTLE_LIMIT` | Max requests per window | `100` | No |
| `THROTTLE_SKIP_IF` | IP addresses to skip rate limiting | `127.0.0.1` | No |
| `MAX_FILE_SIZE` | Maximum file upload size (bytes) | `5242880` (5MB) | No |
| `MAX_REQUEST_SIZE` | Maximum request size (bytes) | `10485760` (10MB) | No |

### Logging Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LOG_LEVEL` | Logging level | `debug` | No |
| `LOG_FORMAT` | Log format | `combined` | No |
| `LOG_FILE_ENABLED` | Enable file logging | `true` | No |
| `LOG_FILE_PATH` | Log file path | `logs/app.log` | No |

#### Log Levels
- `error`: Error messages only
- `warn`: Warnings and errors
- `info`: General information
- `debug`: Detailed debugging information

### Email Configuration (Optional)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `EMAIL_PROVIDER` | Email provider (`smtp`, `sendgrid`, `ses`) | `smtp` | No |
| `EMAIL_FROM` | Default from email | - | No |
| `EMAIL_FROM_NAME` | Default from name | - | No |

#### SMTP Configuration
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SMTP_HOST` | SMTP server host | `localhost` | No |
| `SMTP_PORT` | SMTP server port | `1025` | No |
| `SMTP_SECURE` | Use TLS/SSL | `false` | No |
| `SMTP_USER` | SMTP username | - | No |
| `SMTP_PASS` | SMTP password | - | No |

#### SendGrid Configuration
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SENDGRID_API_KEY` | SendGrid API key | - | No |

#### AWS SES Configuration
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AWS_REGION` | AWS region | `us-east-1` | No |
| `AWS_ACCESS_KEY_ID` | AWS access key | - | No |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - | No |

### Redis Configuration (Optional)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REDIS_HOST` | Redis server host | `localhost` | No |
| `REDIS_PORT` | Redis server port | `6379` | No |
| `REDIS_PASSWORD` | Redis password | - | No |
| `REDIS_DB` | Redis database number | `0` | No |
| `REDIS_TTL` | Default cache TTL (seconds) | `3600` | No |

### File Storage Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `UPLOAD_DESTINATION` | Upload directory | `uploads` | No |
| `UPLOAD_MAX_FILES` | Maximum files per upload | `10` | No |
| `UPLOAD_ALLOWED_EXTENSIONS` | Allowed file extensions | `jpg,jpeg,png,pdf,doc,docx` | No |

### Development Tools

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SWAGGER_ENABLED` | Enable Swagger documentation | `true` | No |
| `SWAGGER_PATH` | Swagger UI path | `docs` | No |
| `SWAGGER_TITLE` | API documentation title | - | No |
| `SWAGGER_DESCRIPTION` | API documentation description | - | No |
| `SWAGGER_VERSION` | API version | `1.0.0` | No |
| `HEALTH_CHECK_ENABLED` | Enable health check endpoint | `true` | No |
| `HEALTH_CHECK_PATH` | Health check endpoint path | `health` | No |

## Environment-Specific Configurations

### Development Environment
```env
NODE_ENV=development
LOG_LEVEL=debug
SWAGGER_ENABLED=true
THROTTLE_LIMIT=1000
JWT_EXPIRES_IN=1h
```

### Staging Environment
```env
NODE_ENV=staging
LOG_LEVEL=info
SWAGGER_ENABLED=true
THROTTLE_LIMIT=500
JWT_EXPIRES_IN=15m
```

### Production Environment
```env
NODE_ENV=production
LOG_LEVEL=error
SWAGGER_ENABLED=false
THROTTLE_LIMIT=100
JWT_EXPIRES_IN=5m
# Use strong, unique secrets!
JWT_SECRET=your-production-jwt-secret-very-long-and-secure
JWT_REFRESH_SECRET=your-production-refresh-secret-very-long-and-secure
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for JWT tokens
3. **Rotate secrets regularly** in production
4. **Use environment-specific configurations**
5. **Enable HTTPS** in production
6. **Restrict CORS origins** to your domains only
7. **Use appropriate rate limiting** for your use case
8. **Monitor logs** for security issues

## Common Issues

### Database Connection
- Ensure PostgreSQL is running
- Check database credentials
- Verify database exists
- Check network connectivity

### JWT Errors
- Ensure JWT secrets are set
- Secrets must be at least 32 characters
- Don't use the example secrets in production

### CORS Issues
- Add your frontend URL to `CORS_ORIGINS`
- Separate multiple origins with commas
- Include the protocol (http/https)

### Rate Limiting
- Adjust `THROTTLE_LIMIT` based on your needs
- Consider adding more IPs to `THROTTLE_SKIP_IF` for development
- Monitor rate limit hits in logs

## Example Configurations

### Local Development with Docker
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/broy_starter_dev"
REDIS_HOST="localhost"
SMTP_HOST="localhost"
SMTP_PORT=1025
```

### Production with External Services
```env
DATABASE_URL="postgresql://user:pass@production-db:5432/app_prod"
REDIS_HOST="production-redis"
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="your-production-sendgrid-key"
```
