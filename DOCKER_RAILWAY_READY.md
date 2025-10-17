# Railway Docker Deployment - Ready! 🚀

All services are now configured for Railway deployment with Docker.

---

## ✅ Files Created

### Backend
- ✅ `Backend/Dockerfile` - Multi-stage build with TypeScript compilation
- ✅ `Backend/.dockerignore` - Excludes unnecessary files from image

### Frontend
- ✅ `Frontend/Dockerfile` - Multi-stage build with Vite + nginx
- ✅ `Frontend/.dockerignore` - Excludes unnecessary files
- ✅ `Frontend/nginx.conf` - SPA routing configuration

### Landing Page
- ✅ `LandingPage/Dockerfile` - Multi-stage build with Vite + nginx
- ✅ `LandingPage/.dockerignore` - Excludes unnecessary files
- ✅ `LandingPage/nginx.conf` - SPA routing configuration

### Documentation
- ✅ `RAILWAY_DEPLOYMENT_GUIDE.md` - Complete step-by-step deployment guide

---

## 🏗️ Docker Architecture

### Backend
```
Build Stage:
1. Install pnpm
2. Install dependencies
3. Build TypeScript → dist/

Production Stage:
1. Install production dependencies only
2. Copy compiled dist/ folder
3. Run with: pnpm start
```

### Frontend & Landing Page
```
Build Stage:
1. Install pnpm
2. Install dependencies
3. Build with Vite (environment variables baked in)
4. Generate optimized static files in dist/

Production Stage (nginx):
1. Copy static files to nginx html directory
2. Configure SPA routing
3. Enable gzip compression
4. Add security headers
```

---

## 🚀 Deployment Steps Summary

### 1. Deploy Backend First
```bash
# Railway will:
# 1. Detect Dockerfile in Backend/
# 2. Build Docker image
# 3. Run container
# 4. Expose on generated domain

# You need to:
# - Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
# - Generate domain
# - Save the URL for Frontend/Landing
```

### 2. Deploy Frontend
```bash
# Railway will:
# 1. Detect Dockerfile in Frontend/
# 2. Pass VITE_* env vars as build args
# 3. Build static bundle
# 4. Serve with nginx

# You need to:
# - Set VITE_GRAPHQL_URL to Backend URL
# - Set other VITE_* variables
# - Generate domain
# - Save URL for Landing Page
```

### 3. Deploy Landing Page
```bash
# Railway will:
# 1. Detect Dockerfile in LandingPage/
# 2. Pass VITE_* env vars as build args
# 3. Build static bundle
# 4. Serve with nginx

# You need to:
# - Set VITE_GRAPHQL_URL to Backend URL
# - Set VITE_FRONTEND_URL to Frontend URL
# - Generate domain
```

### 4. Update Cross-References
```bash
# Backend:
# - Update CORS_ORIGINS with Frontend + Landing URLs
# - Update FRONTEND_URL
# - Update LANDING_PAGE_URL

# Frontend:
# - Update VITE_LANDING_PAGE_URL with Landing URL

# Then redeploy all services
```

---

## 📋 Environment Variables Checklist

### Backend (11 variables)
- [ ] `PORT` - 4000
- [ ] `NODE_ENV` - production
- [ ] `DATABASE_URL` - MongoDB connection string
- [ ] `CORS_ORIGINS` - Frontend,Landing URLs (comma-separated)
- [ ] `FRONTEND_URL` - Frontend Railway URL
- [ ] `LANDING_PAGE_URL` - Landing Railway URL
- [ ] `AUTH_SERVICE_URL` - Auth service URL (if separate)
- [ ] `JWT_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `JWT_EXPIRES_IN` - 15m
- [ ] `REFRESH_JWT_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `REFRESH_JWT_EXPIRES_IN` - 7d

### Frontend (6+ variables)
- [ ] `VITE_NODE_ENV` - production
- [ ] `VITE_GRAPHQL_URL` - Backend GraphQL endpoint
- [ ] `VITE_GRAPHQL_HTTP_URL` - Backend HTTP endpoint
- [ ] `VITE_GRAPHQL_WS_URL` - Backend WebSocket endpoint
- [ ] `VITE_LANDING_PAGE_URL` - Landing page URL
- [ ] `VITE_AUTH_SERVICE_URL` - Auth service URL

### Landing Page (3 variables)
- [ ] `VITE_NODE_ENV` - production
- [ ] `VITE_GRAPHQL_URL` - Backend GraphQL endpoint
- [ ] `VITE_FRONTEND_URL` - Frontend app URL

---

## 🧪 Test Locally with Docker

Before deploying to Railway, test the Docker builds locally:

### Backend
```bash
cd Backend

# Build
docker build -t classecon-backend .

# Run (requires .env file or env vars)
docker run -p 4000:4000 --env-file .env classecon-backend

# Test
curl http://localhost:4000/graphql
```

### Frontend
```bash
cd Frontend

# Build with env vars
docker build \
  --build-arg VITE_GRAPHQL_URL=http://localhost:4000/graphql \
  --build-arg VITE_LANDING_PAGE_URL=http://localhost:5174 \
  -t classecon-frontend .

# Run
docker run -p 80:80 classecon-frontend

# Test
open http://localhost
```

### Landing Page
```bash
cd LandingPage

# Build with env vars
docker build \
  --build-arg VITE_GRAPHQL_URL=http://localhost:4000/graphql \
  --build-arg VITE_FRONTEND_URL=http://localhost:5173 \
  -t classecon-landing .

# Run
docker run -p 80:80 classecon-landing

# Test
open http://localhost
```

---

## 🔍 Key Features

### Multi-Stage Builds
- ✅ Smaller final images (only production dependencies)
- ✅ Faster deployments
- ✅ Better security (no build tools in production)

### Optimized for Railway
- ✅ Auto-detection of Dockerfile
- ✅ Environment variables passed as build args
- ✅ Port configuration (Railway sets PORT automatically)
- ✅ Root directory configuration for monorepo

### Production-Ready
- ✅ Gzip compression (nginx)
- ✅ Security headers
- ✅ SPA routing support
- ✅ Static asset caching
- ✅ Minimal image sizes

---

## 📦 Estimated Image Sizes

- **Backend**: ~200-300 MB (Node + dependencies)
- **Frontend**: ~50-80 MB (nginx + static files)
- **Landing Page**: ~40-60 MB (nginx + static files)

---

## 🎯 Next Steps

1. **Read the full guide**: `RAILWAY_DEPLOYMENT_GUIDE.md`
2. **Set up MongoDB Atlas**: Create production database
3. **Generate JWT secrets**: `openssl rand -base64 32`
4. **Push to GitHub**: Ensure all Dockerfiles are committed
5. **Create Railway account**: https://railway.app
6. **Deploy Backend**: Follow guide step 1
7. **Deploy Frontend**: Follow guide step 2
8. **Deploy Landing Page**: Follow guide step 3
9. **Test beta access flow**: End-to-end verification
10. **Monitor & optimize**: Check logs and performance

---

## 💡 Tips

- **Use Railway CLI**: `npm install -g @railway/cli` for easier management
- **Test locally first**: Use Docker to test before deploying
- **Monitor costs**: Railway charges based on usage
- **Set up alerts**: Use UptimeRobot for uptime monitoring
- **Custom domains**: Add after initial deployment works
- **Database backups**: MongoDB Atlas automatic backups

---

## 📞 Support

If you encounter issues:

1. Check Railway deployment logs
2. Verify environment variables are set correctly
3. Test Docker builds locally
4. Review `RAILWAY_DEPLOYMENT_GUIDE.md` troubleshooting section
5. Check Railway Discord for community support

---

## ✨ Summary

You now have:
- ✅ Production-ready Dockerfiles for all services
- ✅ Nginx configuration for SPA routing
- ✅ Complete deployment documentation
- ✅ Environment variable templates
- ✅ Troubleshooting guides

**All services are ready to deploy to Railway!** 🎉

Follow `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed step-by-step instructions.
