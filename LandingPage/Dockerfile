# ----------------------------
# Stage 1 — Build Vite project
# ----------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files and build
COPY . .
RUN npm run build

# ----------------------------
# Stage 2 — Serve with Nginx
# ----------------------------
FROM nginx:alpine

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
