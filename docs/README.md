# Documentation Index

Complete documentation for Broy NestJS Starter MVP.

## 📚 Available Documentation

### 🏗️ **Architecture & Setup**
- [Implementation Examples](./implementation-example.md) - Implementation examples and best practices
- [Common Utilities](./common-utilities.md) - Available utilities and helpers
- [Environment Configuration](./environment-configuration.md) - Complete guide to environment variables

### 🛠️ **Services Documentation**
- [Services Overview](./services/README.md) - Overview of all available services
- [Time Service](./services/time-service.md) - Time handling service with mock support
- [Cache Service](./services/cache-service.md) - In-memory caching with TTL support
- [Email Service](./services/email-service.md) - Multi-provider email service

## 🚀 Quick Start Guides

### 1. Setup Development Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# See: docs/environment-configuration.md

# Windows
npm run setup:dev

# Unix/Linux/MacOS  
npm run setup:dev:unix
```

### 2. Generate New Module
```bash
./scripts/generate-module.sh ProductName
```

### 3. Common Development Tasks
```bash
# Start development server
npm run start:dev

# Run tests
npm test

# Run database migrations
npm run db:migrate

# Open API documentation
# Visit: http://localhost:3000/api/v1/docs
```

## 📖 Key Concepts

### Services
Services menyediakan business logic dan utilities yang dapat di-reuse across modules.

### Testing
Semua services mendukung testing dengan mock capabilities, khususnya Time Service untuk time-dependent logic.

### Configuration
Environment-based configuration dengan validation menggunakan Joi.

### Database
Prisma ORM dengan PostgreSQL untuk type-safe database operations.

## 🔧 Development Workflow

1. **Create Module** - Gunakan generator script
2. **Add Services** - Inject services yang dibutuhkan
3. **Write Tests** - Test dengan mock services
4. **Update Documentation** - Update docs sesuai perubahan

## 📝 Contributing

Untuk menambah dokumentasi baru:

1. Buat file di folder yang sesuai
2. Update index ini
3. Follow existing documentation format
4. Include code examples

## 🆘 Need Help?

- Check existing documentation di folder ini
- Review implementation examples
- Look at service usage patterns
- Check the main README.md

Happy coding! 🎉
