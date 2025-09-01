# Multi-stage build for production
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json ./packages/db/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend
FROM base AS frontend-builder
WORKDIR /app/apps/frontend
RUN pnpm build

# Build backend
FROM base AS backend-builder  
WORKDIR /app/packages/db
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json ./packages/db/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built backend
COPY --from=backend-builder /app/packages/db/dist ./packages/db/dist
COPY --from=backend-builder /app/packages/db/src ./packages/db/src
COPY --from=backend-builder /app/packages/db/index.ts ./packages/db/

# Copy built frontend to serve statically
COPY --from=frontend-builder /app/apps/frontend/dist ./packages/db/public

# Create volume for SQLite database
VOLUME ["/app/packages/db/data"]

# Expose port
EXPOSE 5173

# Set environment
ENV NODE_ENV=production
ENV PORT=5173

# Start the application
WORKDIR /app/packages/db
CMD ["pnpm", "start"]
