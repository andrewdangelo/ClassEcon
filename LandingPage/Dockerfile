# ----------------------------
# Stage 1 — Build Vite project
# ----------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build arguments for Vite environment variables
# Railway will automatically pass these as build args
ARG VITE_GRAPHQL_URL
ARG VITE_FRONTEND_URL
ARG VITE_NODE_ENV

# Set as environment variables for the build process
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ENV VITE_NODE_ENV=$VITE_NODE_ENV

# Build the application (Vite will embed the VITE_* env vars)
RUN npm run build

# ----------------------------
# Stage 2 — Serve with Nginx
# ----------------------------
FROM nginx:alpine

# Remove default nginx config (prevents conflicts)
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy build output from Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy custom entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose dynamic port
EXPOSE ${PORT:-80}

# Use custom entrypoint to substitute PORT and start nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
