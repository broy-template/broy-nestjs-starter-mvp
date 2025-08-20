#!/bin/bash

# Development setup script
echo "🚀 Setting up Broy NestJS Starter MVP for development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Please update .env file with your configuration"
fi

# Start development services
echo "🐳 Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Run migrations
echo "🗄️ Running database migrations..."
npm run db:migrate

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Development environment is ready!"
echo ""
echo "🔗 Available services:"
echo "   - API: http://localhost:3000"
echo "   - API Docs: http://localhost:3000/api/v1/docs"
echo "   - Database: postgresql://postgres:password@localhost:5433/broy_starter_dev"
echo "   - pgAdmin: http://localhost:5050 (admin@starter.com / admin123)"
echo "   - Redis: redis://localhost:6379"
echo "   - MailHog: http://localhost:8025"
echo "   - MinIO: http://localhost:9001 (minioadmin / minioadmin123)"
echo ""
echo "🏃‍♂️ Start development server:"
echo "   npm run start:dev"
echo ""
echo "🧪 Run tests:"
echo "   npm test"
echo "   npm run test:e2e"
