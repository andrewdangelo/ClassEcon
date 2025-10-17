# Landing Page Dockerfile for Railway deployment

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and config files
COPY . .

# Build arguments for environment variables (Railway will inject these)
ARG VITE_GRAPHQL_URL
ARG VITE_FRONTEND_URL
ARG VITE_NODE_ENV=production

# Set environment variables for build
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ENV VITE_NODE_ENV=$VITE_NODE_ENV

# Build the application
RUN pnpm build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Railway will map this)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
