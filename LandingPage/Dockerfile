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

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Railway auto-maps it)
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
