<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# 🚀 Broy NestJS Starter MVP

> A comprehensive NestJS starter template following enterprise-grade best practices for rapid MVP development.

**Author:** Roy Aziz Barera  
**GitHub:** [https://github.com/forscy](https://github.com/forscy)  
**Version:** 1.0  
**License:** MIT

## 🎯 Features

### 🔐 **Security First**
- ✅ JWT Authentication with Refresh Token strategy
- ✅ Role-Based Access Control (RBAC) - Admin & User roles
- ✅ Resource ownership validation
- ✅ bcrypt password hashing
- ✅ Rate limiting with `@nestjs/throttler`
- ✅ Security headers with Helmet
- ✅ CORS configuration

### 🗄️ **Database & ORM**
- ✅ Prisma ORM with PostgreSQL
- ✅ Database migrations and seeding
- ✅ Connection management with graceful shutdown
- ✅ Health check with database connectivity

### 📝 **API Standards**
- ✅ Consistent JSON response format
- ✅ Comprehensive error handling
- ✅ Input validation with class-validator
- ✅ Response serialization with class-transformer
- ✅ Swagger/OpenAPI documentation

### 📊 **Observability**
- ✅ Structured logging with Pino
- ✅ Request/response logging with correlation IDs
- ✅ Error tracking and monitoring
- ✅ Performance monitoring

### 🏗️ **Architecture**
- ✅ Modular structure following domain-driven design
- ✅ Global guards, filters, and interceptors
- ✅ Configuration management with validation
- ✅ Environment-based configurations

### 🧪 **Testing & Quality**
- ✅ Jest testing framework setup
- ✅ ESLint + Prettier code formatting
- ✅ Git hooks with Husky
- ✅ TypeScript strict mode

### 🐳 **DevOps Ready**
- ✅ Docker containerization
- ✅ Docker Compose for local development
- ✅ Multi-stage Docker builds
- ✅ Health check endpoints

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Docker & Docker Compose ([Download](https://docs.docker.com/get-docker/))
- Git

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd broy-nestjs-starter-mvp
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
```

### 3. Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose -f docker-compose.dev.yml up -d

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 4. Start Development

```bash
# Start in development mode
npm run start:dev

# Application will be available at:
# 🌐 API: http://localhost:3000/api/v1
# 📚 Docs: http://localhost:3000/api/v1/docs
# 🔍 Health: http://localhost:3000/api/v1/health
```

## 📚 Default Accounts

After seeding, these accounts are available:

| Role  | Email                | Password    |
|-------|---------------------|-------------|
| Admin | admin@starter.com   | admin123    |
| User  | user1@starter.com   | password123 |
| User  | user2@starter.com   | password123 |

## 🏗️ Project Structure

```
src/
├── common/                   # Reusable components
│   ├── decorators/          # Custom decorators (@Public, @Roles, @CurrentUser)
│   ├── enums/               # TypeScript enums (Role)
│   ├── filters/             # Exception filters (AllExceptionsFilter)
│   ├── guards/              # Auth guards (JWT, Roles)
│   ├── interceptors/        # Request/response interceptors
│   ├── interfaces/          # TypeScript interfaces
│   └── prisma.service.ts    # Prisma service
├── config/                  # Configuration files
│   ├── app.config.ts        # Application configuration
│   └── validation.config.ts # Environment validation
├── modules/                 # Feature modules
│   ├── auth/               # Authentication module
│   ├── user/               # User management module
│   └── health/             # Health check module
├── app.module.ts           # Root module
└── main.ts                 # Application entry point
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users` - List users (Admin/User)
- `GET /api/v1/users/:id` - Get user by ID (Admin/User)
- `POST /api/v1/users` - Create user (Admin only)
- `PATCH /api/v1/users/:id` - Update user (Admin or own profile)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Health
- `GET /api/v1/health` - Application health check

### Documentation
- `GET /api/v1/docs` - Swagger API documentation

## 🔒 Security Features

### Authentication Flow
1. **Login** → Returns access token (1h) + refresh token (7d)
2. **API Calls** → Use access token in Authorization header
3. **Token Refresh** → Use refresh token to get new access token
4. **Logout** → Invalidates refresh token

### Authorization Levels
- **Public** - No authentication required (`@Public()`)
- **Authenticated** - Valid JWT required
- **Role-Based** - Specific roles required (`@Roles(Role.ADMIN)`)
- **Resource Ownership** - Can only access own resources

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 🐳 Docker Deployment

### Development
```bash
# Start with database
docker-compose -f docker-compose.dev.yml up -d
```

### Production
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app
```

## 📊 Monitoring & Logging

### Log Levels
- **ERROR** - Critical errors requiring attention
- **WARN** - Potential issues (deprecated APIs, etc.)
- **LOG** - Important events (user actions)
- **DEBUG** - Diagnostic information (development only)

### Health Monitoring
Monitor application health via `/api/v1/health`:
```json
{
  "status": "success",
  "data": {
    "status": "ok",
    "uptime": 1234.56,
    "memory": {...},
    "database": {
      "status": "connected",
      "latency": 15
    }
  }
}
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `JWT_REFRESH_SECRET` | Refresh token secret | - | ✅ |
| `JWT_EXPIRES_IN` | Access token expiry | 60m | ❌ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 7d | ❌ |
| `NODE_ENV` | Environment | development | ❌ |
| `PORT` | Application port | 3000 | ❌ |
| `API_PREFIX` | API prefix | api/v1 | ❌ |
| `CORS_ORIGINS` | Allowed origins | localhost:3000 | ❌ |
| `THROTTLE_TTL` | Rate limit window (seconds) | 60 | ❌ |
| `THROTTLE_LIMIT` | Max requests per window | 10 | ❌ |
| `LOG_LEVEL` | Logging level | info | ❌ |

## 🔧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Install git hooks
npm run prepare
```

### Database Operations
```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create new migration
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Open Prisma Studio
npm run db:studio

# Reset database and reseed
npm run db:seed
```

## 🚦 Git Workflow

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature commits
git commit -m "feat(auth): add refresh token rotation"

# Bug fixes
git commit -m "fix(users): prevent duplicate email registration"

# Documentation
git commit -m "docs: update API documentation"

# Chores
git commit -m "chore: update dependencies"
```

## 📈 Scaling Considerations

### Performance
- Enable Prisma connection pooling for production
- Implement Redis for session management
- Use CDN for static assets
- Enable response compression

### Security
- Use external secret management (AWS Secrets Manager, etc.)
- Implement API versioning
- Add request rate limiting per user
- Enable audit logging

### Infrastructure
- Set up horizontal pod autoscaling
- Implement database read replicas
- Use load balancers
- Monitor with APM tools

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Roy Aziz Barera](https://github.com/forscy) - Original architecture and guidelines

---

**⭐ Star this repository if it helps you build better applications!**
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
