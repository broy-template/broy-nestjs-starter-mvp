@echo off
REM Development setup script for Windows
echo 🚀 Setting up Broy NestJS Starter MVP for development...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Copy environment file
if not exist .env (
    echo 📝 Creating environment file...
    copy .env.example .env
    echo ✅ Please update .env file with your configuration
)

REM Start development services
echo 🐳 Starting development services...
docker-compose -f docker-compose.dev.yml up -d

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npm run db:generate

REM Run migrations
echo 🗄️ Running database migrations...
call npm run db:migrate

REM Seed database
echo 🌱 Seeding database...
call npm run db:seed

echo ✅ Development environment is ready!
echo.
echo 🔗 Available services:
echo    - API: http://localhost:3000
echo    - API Docs: http://localhost:3000/api/v1/docs
echo    - Database: postgresql://postgres:password@localhost:5433/broy_starter_dev
echo    - pgAdmin: http://localhost:5050 (admin@starter.com / admin123)
echo    - Redis: redis://localhost:6379
echo    - MailHog: http://localhost:8025
echo    - MinIO: http://localhost:9001 (minioadmin / minioadmin123)
echo.
echo 🏃‍♂️ Start development server:
echo    npm run start:dev
echo.
echo 🧪 Run tests:
echo    npm test
echo    npm run test:e2e

pause
