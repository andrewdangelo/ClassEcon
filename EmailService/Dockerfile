FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Build stage
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production deps only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy built code
COPY --from=builder /app/dist ./dist
# Runtime loads GraphQL SDL from dist/graphql/schema.graphql
COPY --from=builder /app/src/graphql/schema.graphql ./dist/graphql/schema.graphql

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 emailservice
USER emailservice

EXPOSE 4000

# ROLE=api runs the GraphQL server (default); ROLE=worker runs the async processor.
# Used by Cloudflare Containers to run the same image as two workloads.
ENV ROLE=api
CMD ["sh", "-c", "if [ \"$ROLE\" = \"worker\" ]; then node dist/worker/index.js; else node dist/server/index.js; fi"]
