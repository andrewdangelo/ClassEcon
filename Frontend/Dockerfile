# Frontend Dockerfile for Railway deployment

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
ARG VITE_GRAPHQL_HTTP_URL
ARG VITE_GRAPHQL_WS_URL
ARG VITE_LANDING_PAGE_URL
ARG VITE_AUTH_SERVICE_URL
ARG VITE_NODE_ENV=production

# Set environment variables for build
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL
ENV VITE_GRAPHQL_HTTP_URL=$VITE_GRAPHQL_HTTP_URL
ENV VITE_GRAPHQL_WS_URL=$VITE_GRAPHQL_WS_URL
ENV VITE_LANDING_PAGE_URL=$VITE_LANDING_PAGE_URL
ENV VITE_AUTH_SERVICE_URL=$VITE_AUTH_SERVICE_URL
ENV VITE_NODE_ENV=$VITE_NODE_ENV

# Build the application
RUN pnpm build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Expose port (Railway will set PORT env var)
EXPOSE 80

# nginx will substitute $PORT in the template and start
# The official nginx image automatically processes templates in /etc/nginx/templates/
CMD ["nginx", "-g", "daemon off;"]
