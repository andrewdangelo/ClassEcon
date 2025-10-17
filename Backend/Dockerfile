# Backend Dockerfile for Railway deployment

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder (dist directory)
COPY --from=builder /app/dist ./dist

# Copy scripts if needed
COPY --from=builder /app/scripts ./scripts

# Expose port (Railway will set PORT env variable)
EXPOSE 4000

# Start the server
CMD ["pnpm", "start"]
