# Recommended additional dependencies for enhanced features

# File upload
npm install @nestjs/platform-express multer
npm install -D @types/multer

# Email services
npm install @sendgrid/mail
npm install nodemailer
npm install -D @types/nodemailer

# Caching with Redis (optional upgrade from in-memory)
npm install ioredis
npm install -D @types/ioredis

# Background jobs (optional for production)
npm install @nestjs/bull bull
npm install -D @types/bull

# Enhanced validation
npm install class-transformer class-validator

# Compression
npm install compression
npm install -D @types/compression

# Monitoring (optional for production)
npm install @sentry/node @sentry/integrations

# Testing utilities
npm install -D @nestjs/testing supertest

# Development utilities
npm install -D nodemon concurrently

# Documentation
npm install @nestjs/swagger swagger-ui-express

# Health checks
npm install @nestjs/terminus

# Configuration
npm install @nestjs/config joi

# Date utilities (alternative to built-in Time Service)
npm install dayjs
npm install moment-timezone
npm install date-fns date-fns-tz

# Utility libraries
npm install lodash
npm install -D @types/lodash

# UUID generation
npm install uuid
npm install -D @types/uuid

# Crypto utilities
npm install bcrypt
npm install -D @types/bcrypt

# HTTP client
npm install axios

# Environment loading
npm install dotenv

# Git hooks
npm install -D husky lint-staged

# Code quality
npm install -D prettier eslint

# Process management (for production)
npm install -D pm2

# Cron jobs scheduling (optional)
npm install @nestjs/schedule
npm install cron
npm install -D @types/cron
