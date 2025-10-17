#!/bin/bash

# Railway Monorepo - Pre-Deployment Verification Script
# This script verifies all Docker configurations are ready for Railway deployment

echo "🚀 ClassEcon - Railway Deployment Verification"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 - MISSING"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ - MISSING"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

echo "📦 Checking Service Directories..."
echo "-----------------------------------"
check_dir "Backend"
check_dir "Frontend"
check_dir "LandingPage"
check_dir "AuthService"
echo ""

echo "🐳 Checking Dockerfiles..."
echo "-----------------------------------"
check_file "Backend/Dockerfile"
check_file "Frontend/Dockerfile"
check_file "LandingPage/Dockerfile"
check_file "AuthService/Dockerfile"
echo ""

echo "🚫 Checking .dockerignore files..."
echo "-----------------------------------"
check_file "Backend/.dockerignore"
check_file "Frontend/.dockerignore"
check_file "LandingPage/.dockerignore"
check_file "AuthService/.dockerignore"
echo ""

echo "📄 Checking nginx configurations..."
echo "-----------------------------------"
check_file "Frontend/nginx.conf"
check_file "LandingPage/nginx.conf"
echo ""

echo "📦 Checking package.json files..."
echo "-----------------------------------"
check_file "Backend/package.json"
check_file "Frontend/package.json"
check_file "LandingPage/package.json"
check_file "AuthService/package.json"
echo ""

echo "📚 Checking documentation..."
echo "-----------------------------------"
check_file "RAILWAY_DEPLOYMENT_GUIDE.md"
check_file "RAILWAY_MONOREPO_CHECKLIST.md"
check_file "DEPLOYMENT_READY_SUMMARY.md"
check_file "DOCKER_RAILWAY_READY.md"
check_file "README.md"
echo ""

echo "🔧 Checking Docker Compose..."
echo "-----------------------------------"
check_file "docker-compose.yml"
echo ""

# Check package.json scripts
echo "🔍 Verifying package.json scripts..."
echo "-----------------------------------"

# Check Backend scripts
if grep -q '"build"' Backend/package.json && grep -q '"start"' Backend/package.json; then
    echo -e "${GREEN}✓${NC} Backend has 'build' and 'start' scripts"
else
    echo -e "${RED}✗${NC} Backend missing 'build' or 'start' scripts"
    ERRORS=$((ERRORS + 1))
fi

# Check Frontend scripts
if grep -q '"build"' Frontend/package.json; then
    echo -e "${GREEN}✓${NC} Frontend has 'build' script"
else
    echo -e "${RED}✗${NC} Frontend missing 'build' script"
    ERRORS=$((ERRORS + 1))
fi

# Check LandingPage scripts
if grep -q '"build"' LandingPage/package.json; then
    echo -e "${GREEN}✓${NC} LandingPage has 'build' script"
else
    echo -e "${RED}✗${NC} LandingPage missing 'build' script"
    ERRORS=$((ERRORS + 1))
fi

# Check AuthService scripts
if grep -q '"build"' AuthService/package.json && grep -q '"start"' AuthService/package.json; then
    echo -e "${GREEN}✓${NC} AuthService has 'build' and 'start' scripts"
else
    echo -e "${RED}✗${NC} AuthService missing 'build' or 'start' scripts"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check Dockerfile content
echo "🔍 Verifying Dockerfile configurations..."
echo "-----------------------------------"

# Check Backend Dockerfile
if grep -q "FROM node:18-alpine AS builder" Backend/Dockerfile; then
    echo -e "${GREEN}✓${NC} Backend Dockerfile uses multi-stage build"
else
    echo -e "${YELLOW}⚠${NC} Backend Dockerfile may not use multi-stage build"
    WARNINGS=$((WARNINGS + 1))
fi

# Check Frontend Dockerfile
if grep -q "FROM nginx:alpine" Frontend/Dockerfile; then
    echo -e "${GREEN}✓${NC} Frontend Dockerfile uses nginx"
else
    echo -e "${RED}✗${NC} Frontend Dockerfile doesn't use nginx"
    ERRORS=$((ERRORS + 1))
fi

# Check LandingPage Dockerfile
if grep -q "FROM nginx:alpine" LandingPage/Dockerfile; then
    echo -e "${GREEN}✓${NC} LandingPage Dockerfile uses nginx"
else
    echo -e "${RED}✗${NC} LandingPage Dockerfile doesn't use nginx"
    ERRORS=$((ERRORS + 1))
fi

# Check AuthService Dockerfile
if grep -q "FROM node:18-alpine AS builder" AuthService/Dockerfile; then
    echo -e "${GREEN}✓${NC} AuthService Dockerfile uses multi-stage build"
else
    echo -e "${YELLOW}⚠${NC} AuthService Dockerfile may not use multi-stage build"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Summary
echo "=============================================="
echo "📊 VERIFICATION SUMMARY"
echo "=============================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Your ClassEcon monorepo is ready for Railway deployment! 🚀"
    echo ""
    echo "Next steps:"
    echo "1. Review RAILWAY_DEPLOYMENT_GUIDE.md"
    echo "2. Generate JWT secrets (openssl rand -base64 32)"
    echo "3. Set up MongoDB Atlas"
    echo "4. Deploy to Railway"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ ${WARNINGS} WARNING(S) FOUND${NC}"
    echo ""
    echo "Your project should be ready, but review the warnings above."
    echo ""
    exit 0
else
    echo -e "${RED}❌ ${ERRORS} ERROR(S) FOUND${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ ${WARNINGS} WARNING(S) FOUND${NC}"
    fi
    echo ""
    echo "Please fix the errors above before deploying."
    echo ""
    exit 1
fi
