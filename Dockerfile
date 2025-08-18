# Multi-stage build untuk optimasi
FROM node:18-alpine AS base

# Install dependencies untuk Prisma
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Install all dependencies including dev dependencies
FROM base AS build-deps  
RUN npm ci

# Build stage
FROM build-deps AS build
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS production

RUN apk add --no-cache dumb-init libc6-compat

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy built application
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js || exit 1

CMD ["dumb-init", "node", "dist/main"]
