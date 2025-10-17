# Production Deployment Guide

This guide covers deploying all services (Backend, Frontend, Landing Page) to production with proper environment configuration.

---

## Overview

The ClassEcon application consists of three main services:
- **Backend** - Node.js/Express GraphQL API (port 4000 in dev)
- **Frontend** - React application for authenticated users (port 5173 in dev)
- **Landing Page** - React application for public/beta access (port 5174 in dev)

All services are now configured to use environment variables, making them portable across development, staging, and production environments.

---

## Environment Variables

### Backend (.env)

```bash
# Server Configuration
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/classecon?retryWrites=true&w=majority

# CORS Configuration (comma-separated URLs)
CORS_ORIGINS=https://app.classecon.com,https://www.classecon.com,https://classecon.com

# Application URLs
FRONTEND_URL=https://app.classecon.com
LANDING_PAGE_URL=https://www.classecon.com

# Auth Service
AUTH_SERVICE_URL=https://auth.classecon.com

# JWT Configuration
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-chars

# OAuth (if enabled)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.classecon.com/auth/google/callback
```

### Frontend (.env)

```bash
# Environment
VITE_NODE_ENV=production

# API Configuration
VITE_GRAPHQL_URL=https://api.classecon.com/graphql
VITE_GRAPHQL_HTTP_URL=https://api.classecon.com/graphql
VITE_GRAPHQL_WS_URL=wss://api.classecon.com/graphql

# Application URLs
VITE_LANDING_PAGE_URL=https://www.classecon.com

# Auth Service
VITE_AUTH_SERVICE_URL=https://auth.classecon.com

# OAuth (if enabled)
VITE_ENABLE_OAUTH=true
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_OAUTH_REDIRECT_URI=https://app.classecon.com/auth/callback
```

### Landing Page (.env)

```bash
# Environment
VITE_NODE_ENV=production

# API Configuration
VITE_GRAPHQL_URL=https://api.classecon.com/graphql

# Application URLs
VITE_FRONTEND_URL=https://app.classecon.com
```

---

## Pre-Deployment Checklist

### 1. Environment Files
- [ ] Create `.env` files for each service (do NOT commit these)
- [ ] Verify all environment variables are set with production values
- [ ] Double-check MongoDB connection string
- [ ] Ensure JWT secrets are strong (min 32 characters)
- [ ] Verify all URLs use HTTPS (not HTTP)

### 2. Database Setup
- [ ] Set up production MongoDB database (MongoDB Atlas recommended)
- [ ] Create database user with appropriate permissions
- [ ] Whitelist production server IPs in MongoDB Atlas
- [ ] Test database connection

### 3. Security
- [ ] Generate strong JWT secrets (use `openssl rand -base64 32`)
- [ ] Set up HTTPS/SSL certificates for all domains
- [ ] Configure firewalls to only allow necessary ports
- [ ] Review CORS_ORIGINS to only allow your domains
- [ ] Enable rate limiting on API endpoints
- [ ] Review and remove any debug logs or console.log statements

### 4. Build Process
- [ ] Run `pnpm install` in all service directories
- [ ] Build frontend: `cd Frontend && pnpm build`
- [ ] Build landing page: `cd LandingPage && pnpm build`
- [ ] Test backend build: `cd Backend && pnpm build` (if using TypeScript compilation)

---

## Deployment Steps

### Option 1: Docker Deployment (Recommended)

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start server
CMD ["pnpm", "start"]
```

#### Frontend/Landing Page Dockerfile
```dockerfile
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

# Build application
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose (for all services)
```yaml
version: '3.8'

services:
  backend:
    build: ./Backend
    ports:
      - "4000:4000"
    env_file:
      - ./Backend/.env
    restart: unless-stopped

  frontend:
    build: ./Frontend
    ports:
      - "5173:80"
    env_file:
      - ./Frontend/.env
    restart: unless-stopped

  landing:
    build: ./LandingPage
    ports:
      - "5174:80"
    env_file:
      - ./LandingPage/.env
    restart: unless-stopped
```

Deploy with: `docker-compose up -d`

---

### Option 2: Traditional Deployment

#### Backend Deployment (Node.js Server)

1. **SSH into your server:**
   ```bash
   ssh user@your-server.com
   ```

2. **Clone repository:**
   ```bash
   git clone https://github.com/yourusername/classecon.git
   cd classecon/Backend
   ```

3. **Install dependencies:**
   ```bash
   npm install -g pnpm
   pnpm install --frozen-lockfile
   ```

4. **Create .env file:**
   ```bash
   nano .env
   # Paste production environment variables
   ```

5. **Start with PM2 (process manager):**
   ```bash
   npm install -g pm2
   pm2 start src/index.ts --name classecon-backend
   pm2 save
   pm2 startup
   ```

#### Frontend/Landing Page Deployment (Static Files)

1. **Build locally or on server:**
   ```bash
   cd Frontend
   pnpm install
   pnpm build
   # Repeat for LandingPage
   ```

2. **Deploy to hosting provider:**

   **Option A: Vercel**
   ```bash
   npm install -g vercel
   cd Frontend
   vercel --prod
   ```

   **Option B: Netlify**
   ```bash
   npm install -g netlify-cli
   cd Frontend
   netlify deploy --prod --dir=dist
   ```

   **Option C: Traditional Server (Nginx)**
   ```bash
   # Copy built files to server
   scp -r dist/* user@server:/var/www/app.classecon.com/

   # Nginx configuration
   server {
       listen 80;
       server_name app.classecon.com;
       
       root /var/www/app.classecon.com;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

---

## Post-Deployment Verification

### 1. Backend Health Check
```bash
curl https://api.classecon.com/health
# Should return 200 OK
```

### 2. GraphQL API Test
```bash
curl -X POST https://api.classecon.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
# Should return: {"data":{"__typename":"Query"}}
```

### 3. CORS Test
Open browser console on your frontend domain:
```javascript
fetch('https://api.classecon.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '{ __typename }' })
})
```
Should complete without CORS errors.

### 4. Beta Access Flow Test
1. Visit landing page: `https://www.classecon.com`
2. Click "Sign In" or "Get Started"
3. Enter a valid beta code
4. Should redirect to: `https://app.classecon.com/auth?betaCode=YOURCODE`
5. Frontend should validate code and grant access

---

## Monitoring & Maintenance

### Recommended Tools
- **Application Monitoring**: New Relic, Datadog, or Sentry
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Log Management**: Loggly, Papertrail, or CloudWatch
- **Error Tracking**: Sentry, Rollbar

### Backend Logs (PM2)
```bash
pm2 logs classecon-backend
pm2 monit
```

### Database Backups
Set up automated MongoDB backups:
- MongoDB Atlas: Enable automatic backups in dashboard
- Self-hosted: Use `mongodump` in cron jobs

---

## Troubleshooting

### Issue: CORS Errors
**Solution:** Verify `CORS_ORIGINS` in backend .env includes all frontend domains (with correct protocol)

### Issue: Beta Code Not Working
**Solution:** 
1. Check backend logs for validation errors
2. Verify MongoDB connection
3. Ensure beta code exists and is active: `db.betaaccesscodes.find()`
4. Check browser console for GraphQL errors

### Issue: Frontend Shows Blank Page
**Solution:**
1. Check browser console for errors
2. Verify all `VITE_*` environment variables are set correctly
3. Ensure GraphQL API is accessible from frontend domain
4. Check nginx/server configuration for SPA routing

### Issue: Environment Variables Not Working
**Solution:**
1. **Backend:** Variables loaded at runtime, restart server after changes
2. **Frontend/Landing:** Variables baked into build, must rebuild after .env changes
3. Verify variable names match exactly (case-sensitive)

---

## Scaling Considerations

### Backend Scaling
- Use load balancer (Nginx, HAProxy, AWS ALB)
- Run multiple backend instances with PM2 cluster mode:
  ```bash
  pm2 start src/index.ts -i max --name classecon-backend
  ```
- Consider Redis for session storage and caching

### Database Scaling
- MongoDB Atlas auto-scaling
- Set up read replicas for read-heavy operations
- Implement database indexing on frequently queried fields

### CDN for Static Assets
- Use Cloudflare, CloudFront, or Fastly
- Cache frontend build files
- Reduce server load and improve global performance

---

## Beta Code Management in Production

### Creating Beta Codes (CLI)
```bash
cd Backend
node scripts/generate-beta-code.ts --code PROD2024 --description "Production beta users" --maxUses 100
```

### Creating Beta Codes (GraphQL)
```graphql
mutation {
  createBetaCode(
    code: "PROD2024"
    description: "Production beta users"
    maxUses: 100
    expiresAt: "2024-12-31T23:59:59Z"
  ) {
    success
    message
    code {
      code
      currentUses
      maxUses
    }
  }
}
```

### Monitoring Beta Codes
Check usage in MongoDB:
```javascript
db.betaaccesscodes.find({ isActive: true })
db.betaaccesscodes.find({ code: "PROD2024" })
```

---

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use strong secrets** - Minimum 32 characters, random
3. **Enable HTTPS** - Use Let's Encrypt for free SSL
4. **Implement rate limiting** - Prevent API abuse
5. **Sanitize inputs** - Prevent injection attacks
6. **Keep dependencies updated** - Run `pnpm audit` regularly
7. **Monitor logs** - Set up alerts for errors and suspicious activity
8. **Backup regularly** - Automate database backups
9. **Use environment-specific configs** - Don't use dev configs in prod
10. **Restrict database access** - Use IP whitelisting and strong passwords

---

## Rollback Plan

If deployment fails:

1. **Backend:** 
   ```bash
   pm2 stop classecon-backend
   git checkout previous-working-commit
   pnpm install
   pm2 start src/index.ts --name classecon-backend
   ```

2. **Frontend/Landing:**
   - Revert to previous build
   - Or: Rollback via hosting provider (Vercel/Netlify have one-click rollback)

3. **Database:**
   - Restore from backup if schema changes caused issues

---

## Support & Resources

- **MongoDB Atlas:** https://cloud.mongodb.com
- **PM2 Documentation:** https://pm2.keymetrics.io
- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-mode.html
- **GraphQL Best Practices:** https://graphql.org/learn/best-practices/
- **Express Security:** https://expressjs.com/en/advanced/best-practice-security.html

---

## Summary

✅ **All services are now production-ready with environment-based configuration**

Key files updated:
- `Backend/.env.example` - All backend environment variables
- `Backend/src/config.ts` - Centralized configuration with env parsing
- `Backend/src/index.ts` - CORS configuration uses env variables
- `Frontend/.env.example` - All frontend environment variables
- `Frontend/src/vite-env.d.ts` - TypeScript definitions for Vite env vars
- `Frontend/src/components/auth/BetaAccessGuard.tsx` - Uses VITE_GRAPHQL_URL and VITE_LANDING_PAGE_URL
- `LandingPage/.env.example` - Landing page environment variables
- `LandingPage/src/vite-env.d.ts` - TypeScript definitions
- `LandingPage/src/components/BetaAccessModal.tsx` - Uses VITE_GRAPHQL_URL and VITE_FRONTEND_URL

**Next Steps:**
1. Create `.env` files for each service (copy from `.env.example`)
2. Update with production values (domains, database URL, secrets)
3. Test locally with production-like environment
4. Deploy using your chosen method (Docker recommended)
5. Verify all services are working correctly
6. Set up monitoring and backups

Good luck with your production deployment! 🚀
