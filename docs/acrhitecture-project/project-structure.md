# Project Structure Documentation

## Broy NestJS Starter MVP - Struktur Folder

Dokumen ini menjelaskan struktur folder dan organisasi kode dalam project NestJS Starter MVP ini.

## 📁 Root Directory

```
broy-nestjs-starter-mvp/
├── 📁 .git/                      # Git repository data
├── 📁 .husky/                    # Git hooks configuration
├── 📁 dist/                      # Compiled TypeScript output
├── 📁 docs/                      # Project documentation
├── 📁 node_modules/              # Node.js dependencies
├── 📁 prisma/                    # Database schema and migrations
├── 📁 scripts/                   # Setup and utility scripts
├── 📁 src/                       # Source code (main application)
├── 📁 test/                      # End-to-end tests
├── 📁 uploads/                   # File upload storage
├── 📄 .env                       # Environment variables (local)
├── 📄 .env.example               # Environment variables template
├── 📄 .env.production.example    # Production environment template
├── 📄 .gitignore                 # Git ignore rules
├── 📄 .nvmrc                     # Node.js version specification
├── 📄 .prettierrc                # Code formatting configuration
├── 📄 docker-compose.yml         # Docker production configuration
├── 📄 docker-compose.dev.yml     # Docker development configuration
├── 📄 Dockerfile                 # Docker image build instructions
├── 📄 eslint.config.mjs          # ESLint configuration
├── 📄 healthcheck.js             # Docker health check script
├── 📄 LICENSE                    # Project license
├── 📄 nest-cli.json              # NestJS CLI configuration
├── 📄 package.json               # Node.js dependencies and scripts
├── 📄 README.md                  # Project overview and setup
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 tsconfig.build.json        # TypeScript build configuration
└── 📄 TODO.md                    # Project TODO list
```

## 📁 Source Code Structure (`src/`)

```
src/
├── 📁 common/                    # Shared utilities and components
│   ├── 📁 decorators/           # Custom decorators
│   ├── 📁 dto/                  # Data Transfer Objects (shared)
│   ├── 📁 entities/             # Database entities (shared)
│   ├── 📁 filters/              # Exception filters
│   ├── 📁 guards/               # Authentication and authorization guards
│   ├── 📁 helpers/              # Utility functions
│   ├── 📁 interceptors/         # Request/response interceptors
│   ├── 📁 interfaces/           # TypeScript interfaces
│   ├── 📁 response/             # Response formatting utilities
│   ├── 📁 services/             # Shared services
│   ├── 📁 testing/              # Testing utilities
│   ├── 📄 index.ts              # Common exports
│   ├── 📄 prisma.module.ts      # Prisma database module
│   └── 📄 prisma.service.ts     # Prisma database service
├── 📁 config/                   # Application configuration
├── 📁 files/                    # File management module
├── 📁 modules/                  # Feature modules
│   ├── 📁 auth/                 # Authentication module
│   ├── 📁 files/                # Files module (duplicate, legacy)
│   ├── 📁 health/               # Health check module
│   └── 📁 user/                 # User management module
├── 📄 app.controller.ts         # Main app controller
├── 📄 app.controller.spec.ts    # Main app controller tests
├── 📄 app.module.ts             # Root application module
├── 📄 app.service.ts            # Main app service
└── 📄 main.ts                   # Application entry point
```

## 📁 Common Directory Structure

### 🎨 Decorators (`common/decorators/`)
```
decorators/
├── 📄 current-user.decorator.ts      # Extract current user from request
├── 📄 public.decorator.ts            # Mark endpoints as public
├── 📄 roles.decorator.ts             # Role-based access control
├── 📄 skip-response-transform.decorator.ts  # Skip response transformation
└── 📄 validation.decorator.ts        # Custom validation decorators
```

### 📦 DTOs (`common/dto/`)
```
dto/
├── 📄 query.dto.ts               # Common query parameters
└── 📄 user.dto.ts                # User-related DTOs
```

### 🛡️ Guards (`common/guards/`)
```
guards/
├── 📄 jwt-auth.guard.ts          # JWT authentication guard
├── 📄 jwt-refresh-auth.guard.ts  # JWT refresh token guard
└── 📄 roles.guard.ts             # Role-based authorization guard
```

### 🔧 Services (`common/services/`)
```
services/
├── 📄 base.service.ts            # Base service with common methods
├── 📄 cache.service.ts           # Redis caching service
├── 📄 email.service.ts           # Email sending service
├── 📄 file-upload.service.ts     # File upload utilities
├── 📄 index.ts                   # Service exports
├── 📄 time.service.ts            # Time manipulation utilities
└── 📄 time.service.spec.ts       # Time service tests
```

### 🔄 Interceptors (`common/interceptors/`)
```
interceptors/
├── 📄 logging.interceptor.ts            # Request/response logging
├── 📄 response-transform.interceptor.ts # Standardize API responses
└── 📄 watermark.interceptor.ts          # Add metadata to responses
```

### 🚫 Filters (`common/filters/`)
```
filters/
├── 📄 all-exceptions.filter.ts   # Global exception handler
└── 📄 prisma-exception.filter.ts # Prisma-specific exception handler
```

## 📁 Modules Structure

### 🔐 Authentication Module (`modules/auth/`)
```
auth/
├── 📁 dto/                       # Authentication DTOs
│   ├── 📄 login.dto.ts          # Login request DTO
│   ├── 📄 refresh-token.dto.ts  # Refresh token DTO
│   └── 📄 register.dto.ts       # Registration DTO
├── 📄 auth.controller.ts         # Authentication endpoints
├── 📄 auth.module.ts            # Authentication module
├── 📄 auth.service.ts           # Authentication business logic
└── 📄 jwt.strategy.ts           # JWT passport strategy
```

### 👤 User Module (`modules/user/`)
```
user/
├── 📁 dto/                       # User management DTOs
│   ├── 📄 create-user.dto.ts    # Create user DTO
│   ├── 📄 get-users.dto.ts      # Query users DTO
│   ├── 📄 update-avatar.dto.ts  # Update avatar DTO
│   └── 📄 update-user.dto.ts    # Update user DTO
├── 📄 user.controller.ts         # User management endpoints
├── 📄 user.module.ts            # User module
└── 📄 user.service.ts           # User business logic
```

### 📁 Files Module (`files/`)
```
files/
├── 📁 dto/                       # File management DTOs
│   └── 📄 file-upload.dto.ts    # File upload DTOs
├── 📄 files.controller.ts        # File management endpoints
├── 📄 files.module.ts           # Files module
└── 📄 files.service.ts          # File management business logic
```

### 🏥 Health Module (`modules/health/`)
```
health/
├── 📄 health.controller.ts       # Health check endpoints
└── 📄 health.module.ts          # Health check module
```

## 📁 Database Structure (`prisma/`)

```
prisma/
├── 📁 migrations/                # Database migration files
│   ├── 📄 migration_lock.toml   # Migration lock file
│   └── 📁 [timestamp]_[name]/   # Individual migration folders
├── 📄 schema.prisma             # Database schema definition
└── 📄 seed.ts                   # Database seeding script
```

## 📁 Configuration (`config/`)

```
config/
├── 📄 app.config.ts             # Application configuration
├── 📄 swagger.config.ts         # API documentation configuration
└── 📄 validation.config.ts      # Validation pipe configuration
```

## 📁 Documentation (`docs/`)

```
docs/
├── 📁 services/                  # Service-specific documentation
├── 📄 authentication-debug.md   # Auth debugging guide
├── 📄 common-utilities.md        # Common utilities documentation
├── 📄 DEPENDENCIES.md           # Project dependencies
├── 📄 environment-configuration.md  # Environment setup
├── 📄 implementation-example.md # Implementation examples
├── 📄 README.md                 # Documentation index
├── 📄 role-based-access-control.md  # RBAC documentation
├── 📄 secure-file-upload-blueprint.md  # File upload security
├── 📄 time-service.md           # Time service documentation
└── 📄 user-avatar-api.md        # Avatar API documentation
```

## 📁 Scripts (`scripts/`)

```
scripts/
├── 📄 setup-dev.bat            # Windows development setup
├── 📄 setup-dev.sh             # Unix development setup
└── 📄 validate-env.js          # Environment validation script
```

## 🗂️ File Organization Principles

### 1. **Modular Architecture**
- Setiap fitur diorganisir dalam module terpisah
- Module memiliki controller, service, dan DTO sendiri
- Shared utilities diletakkan di folder `common/`

### 2. **Separation of Concerns**
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic dan data processing
- **DTOs**: Data transfer dan validation
- **Entities**: Database model representation

### 3. **Layered Structure**
```
┌─────────────┐
│ Controllers │ ← HTTP Layer
├─────────────┤
│  Services   │ ← Business Logic Layer
├─────────────┤
│   DTOs      │ ← Data Transfer Layer
├─────────────┤
│  Entities   │ ← Data Model Layer
└─────────────┘
```

### 4. **Common Utilities**
- **Decorators**: Custom annotations
- **Guards**: Authentication & authorization
- **Interceptors**: Request/response manipulation
- **Filters**: Exception handling
- **Helpers**: Utility functions

## 🚀 Getting Started

1. **Environment Setup**: Lihat `.env.example` untuk konfigurasi
2. **Database**: Setup Prisma dan migrasi di folder `prisma/`
3. **Development**: Gunakan script di folder `scripts/`
4. **Testing**: End-to-end tests di folder `test/`
5. **Documentation**: Dokumentasi lengkap di folder `docs/`

## 📝 Naming Conventions

- **Files**: kebab-case (example-file.ts)
- **Classes**: PascalCase (ExampleClass)
- **Variables**: camelCase (exampleVariable)
- **Constants**: SCREAMING_SNAKE_CASE (EXAMPLE_CONSTANT)
- **Folders**: kebab-case (example-folder)

## 🔗 Module Dependencies

```
App Module
├── Auth Module
├── User Module
├── Files Module
├── Health Module
├── Prisma Module
└── Common Utilities
```

Struktur ini dirancang untuk:
- **Maintainability**: Mudah dipelihara dan dikembangkan
- **Scalability**: Dapat berkembang seiring kebutuhan
- **Testability**: Mudah untuk testing dan debugging
- **Reusability**: Komponen dapat digunakan ulang
