# 🚀 Broy NestJS Starter MVP

> A comprehensive NestJS starter template following enterprise-grade best practices for rapid MVP development.

**Author:** Roy Aziz Barera  
**GitHub:** [https://github.com/forscy](https://github.com/forscy)  
**Version:** 1.0.0  
**License:** MIT

## 🎯 Features

### 🔐 **Security First**
- ✅ JWT Authentication with Refresh Token strategy
- ✅ Role-Based Access Control (RBAC) - Admin & User roles
- ✅ Rate limiting with configurable throttling
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Input validation with class-validator
- ✅ SQL injection protection with Prisma ORM

### 🏗️ **Architecture & Development**
- ✅ Modular architecture with feature-based modules
- ✅ Clean code structure following NestJS best practices
- ✅ TypeScript with strict type checking
- ✅ Comprehensive error handling
- ✅ Request/Response logging with Pino
- ✅ Global response formatting
- ✅ Environment-based configuration
- ✅ Database migrations with Prisma
- ✅ Automated testing setup (Unit & E2E)

### 📚 **API Documentation**
- ✅ Swagger/OpenAPI documentation
- ✅ Auto-generated API docs with examples
- ✅ Bearer token authentication in docs
- ✅ Organized endpoints with tags

### 🗄️ **Database & Caching**
- ✅ PostgreSQL with Prisma ORM
- ✅ Database seeding with sample data
- ✅ Redis caching support
- ✅ Connection pooling and optimization

### 🔧 **Development Tools**
- ✅ Docker & Docker Compose for development
- ✅ Hot reload for development
- ✅ ESLint & Prettier for code quality
- ✅ Husky git hooks
- ✅ Automated setup scripts
- ✅ Module generator scripts

### 📧 **Communication & File Management**
- ✅ Email service dengan multiple providers
- ✅ File upload dengan validation
- ✅ Image optimization dan processing ready

### 🔄 **Development Services**
- ✅ Time service untuk testing flexibility
- ✅ Cache service untuk performance
- ✅ Background job processing ready

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- Git

### 1. Clone & Setup
```bash
git clone <repository-url>
cd broy-nestjs-starter-mvp
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development Environment
```bash
# Windows
npm run setup:dev

# Unix/Linux/MacOS
npm run setup:dev:unix
```

This will:
- Start PostgreSQL, Redis, MailHog, pgAdmin, and MinIO
- Generate Prisma client
- Run database migrations
- Seed database with sample data

### 4. Start Development Server
```bash
npm run start:dev
```

## 🔗 Development Services

| Service | URL | Credentials |
|---------|-----|-------------|
| API Server | http://localhost:3000 | - |
| API Documentation | http://localhost:3000/api/v1/docs | - |
| Database (PostgreSQL) | postgresql://postgres:password@localhost:5433/broy_starter_dev | - |
| pgAdmin | http://localhost:5050 | admin@starter.com / admin123 |
| Redis | redis://localhost:6379 | - |
| MailHog (Email Testing) | http://localhost:8025 | - |
| MinIO (S3 Storage) | http://localhost:9001 | minioadmin / minioadmin123 |

## 📖 API Documentation

Access the interactive API documentation at:
- **Development:** http://localhost:3000/api/v1/docs
- **Authentication:** Use the "Authorize" button with Bearer token

### Sample API Endpoints

```bash
# Register new user
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123"
}

# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Get current user profile
GET /api/v1/users/profile
Authorization: Bearer <jwt-token>

# Upload file
POST /api/v1/files/upload
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

## 🏗️ Project Structure

```
src/
├── common/              # Shared utilities, guards, interceptors
│   ├── decorators/      # Custom decorators
│   ├── dto/            # Data Transfer Objects
│   ├── filters/        # Exception filters
│   ├── guards/         # Authentication & authorization guards
│   ├── helpers/        # Utility functions
│   ├── interceptors/   # Request/response interceptors
│   ├── services/       # Shared services
│   └── interfaces/     # TypeScript interfaces
├── config/             # Configuration files
├── modules/            # Feature modules
│   ├── auth/          # Authentication module
│   ├── user/          # User management module
│   ├── user-profile/  # User profile module
│   └── health/        # Health check module
├── app.module.ts      # Root application module
└── main.ts           # Application entry point
```

## 🛠️ Development Workflow

### Generate New Module
```bash
# Generate complete CRUD module
./scripts/generate-module.sh ModuleName
```

### Database Operations
```bash
# Generate Prisma client
npm run db:generate

# Create and run migration
npm run db:migrate

# Reset database
npm run db:reset

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

### Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Check linting without fixing
npm run lint:check
```

### Docker Operations
```bash
# Start development services
npm run docker:dev

# Stop development services
npm run docker:dev:down

# View logs
npm run docker:logs

# Production deployment
npm run docker:prod
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5433/broy_starter_dev

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=60m
JWT_REFRESH_EXPIRES_IN=7d

# Features
ENABLE_SWAGGER=true
ENABLE_EMAIL_VERIFICATION=true
ENABLE_FILE_UPLOAD=true
```

### Adding New Features

1. **Create Module:**
   ```bash
   ./scripts/generate-module.sh FeatureName
   ```

2. **Add Prisma Model:**
   ```prisma
   model Feature {
     id        String   @id @default(uuid())
     name      String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

3. **Run Migration:**
   ```bash
   npm run db:migrate
   ```

4. **Import Module:**
   ```typescript
   // app.module.ts
   import { FeatureModule } from './modules/feature/feature.module';
   
   @Module({
     imports: [..., FeatureModule],
   })
   ```

## 🧪 Testing

### Sample Test Data

Default users created by seeder:
- **Admin:** admin@starter.com / admin123
- **User:** john.doe@starter.com / password123
- **User:** jane.smith@starter.com / password123

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- auth.service.spec.ts

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## 📦 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Production
```bash
docker-compose up -d
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set strong JWT secrets
4. Configure email service
5. Set up monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** Check the `docs/` folder for detailed guides
- **Issues:** Open an issue on GitHub
- **Discussions:** Use GitHub Discussions for questions

## 🗺️ Roadmap

- [ ] GraphQL support
- [ ] WebSocket real-time features
- [ ] Advanced caching strategies
- [ ] Microservices architecture
- [ ] Cloud deployment guides
- [ ] Advanced monitoring
- [ ] Multi-tenant support

---

⭐ **Star this repository if it helped you build your MVP faster!**
