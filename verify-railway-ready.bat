@echo off
REM Railway Monorepo - Pre-Deployment Verification Script (Windows)
REM This script verifies all Docker configurations are ready for Railway deployment

echo.
echo ============================================
echo   ClassEcon - Railway Deployment Verification
echo ============================================
echo.

set ERRORS=0
set WARNINGS=0

echo Checking Service Directories...
echo -----------------------------------
if exist "Backend\" (echo [OK] Backend\) else (echo [ERROR] Backend\ - MISSING & set /a ERRORS+=1)
if exist "Frontend\" (echo [OK] Frontend\) else (echo [ERROR] Frontend\ - MISSING & set /a ERRORS+=1)
if exist "LandingPage\" (echo [OK] LandingPage\) else (echo [ERROR] LandingPage\ - MISSING & set /a ERRORS+=1)
if exist "AuthService\" (echo [OK] AuthService\) else (echo [ERROR] AuthService\ - MISSING & set /a ERRORS+=1)
echo.

echo Checking Dockerfiles...
echo -----------------------------------
if exist "Backend\Dockerfile" (echo [OK] Backend/Dockerfile) else (echo [ERROR] Backend/Dockerfile - MISSING & set /a ERRORS+=1)
if exist "Frontend\Dockerfile" (echo [OK] Frontend/Dockerfile) else (echo [ERROR] Frontend/Dockerfile - MISSING & set /a ERRORS+=1)
if exist "LandingPage\Dockerfile" (echo [OK] LandingPage/Dockerfile) else (echo [ERROR] LandingPage/Dockerfile - MISSING & set /a ERRORS+=1)
if exist "AuthService\Dockerfile" (echo [OK] AuthService/Dockerfile) else (echo [ERROR] AuthService/Dockerfile - MISSING & set /a ERRORS+=1)
echo.

echo Checking .dockerignore files...
echo -----------------------------------
if exist "Backend\.dockerignore" (echo [OK] Backend/.dockerignore) else (echo [ERROR] Backend/.dockerignore - MISSING & set /a ERRORS+=1)
if exist "Frontend\.dockerignore" (echo [OK] Frontend/.dockerignore) else (echo [ERROR] Frontend/.dockerignore - MISSING & set /a ERRORS+=1)
if exist "LandingPage\.dockerignore" (echo [OK] LandingPage/.dockerignore) else (echo [ERROR] LandingPage/.dockerignore - MISSING & set /a ERRORS+=1)
if exist "AuthService\.dockerignore" (echo [OK] AuthService/.dockerignore) else (echo [ERROR] AuthService/.dockerignore - MISSING & set /a ERRORS+=1)
echo.

echo Checking nginx configurations...
echo -----------------------------------
if exist "Frontend\nginx.conf" (echo [OK] Frontend/nginx.conf) else (echo [ERROR] Frontend/nginx.conf - MISSING & set /a ERRORS+=1)
if exist "LandingPage\nginx.conf" (echo [OK] LandingPage/nginx.conf) else (echo [ERROR] LandingPage/nginx.conf - MISSING & set /a ERRORS+=1)
echo.

echo Checking package.json files...
echo -----------------------------------
if exist "Backend\package.json" (echo [OK] Backend/package.json) else (echo [ERROR] Backend/package.json - MISSING & set /a ERRORS+=1)
if exist "Frontend\package.json" (echo [OK] Frontend/package.json) else (echo [ERROR] Frontend/package.json - MISSING & set /a ERRORS+=1)
if exist "LandingPage\package.json" (echo [OK] LandingPage/package.json) else (echo [ERROR] LandingPage/package.json - MISSING & set /a ERRORS+=1)
if exist "AuthService\package.json" (echo [OK] AuthService/package.json) else (echo [ERROR] AuthService/package.json - MISSING & set /a ERRORS+=1)
echo.

echo Checking documentation...
echo -----------------------------------
if exist "RAILWAY_DEPLOYMENT_GUIDE.md" (echo [OK] RAILWAY_DEPLOYMENT_GUIDE.md) else (echo [ERROR] RAILWAY_DEPLOYMENT_GUIDE.md - MISSING & set /a ERRORS+=1)
if exist "RAILWAY_MONOREPO_CHECKLIST.md" (echo [OK] RAILWAY_MONOREPO_CHECKLIST.md) else (echo [ERROR] RAILWAY_MONOREPO_CHECKLIST.md - MISSING & set /a ERRORS+=1)
if exist "DEPLOYMENT_READY_SUMMARY.md" (echo [OK] DEPLOYMENT_READY_SUMMARY.md) else (echo [ERROR] DEPLOYMENT_READY_SUMMARY.md - MISSING & set /a ERRORS+=1)
if exist "DOCKER_RAILWAY_READY.md" (echo [OK] DOCKER_RAILWAY_READY.md) else (echo [ERROR] DOCKER_RAILWAY_READY.md - MISSING & set /a ERRORS+=1)
if exist "README.md" (echo [OK] README.md) else (echo [ERROR] README.md - MISSING & set /a ERRORS+=1)
echo.

echo Checking Docker Compose...
echo -----------------------------------
if exist "docker-compose.yml" (echo [OK] docker-compose.yml) else (echo [ERROR] docker-compose.yml - MISSING & set /a ERRORS+=1)
echo.

echo.
echo ============================================
echo   VERIFICATION SUMMARY
echo ============================================
echo.

if %ERRORS%==0 (
    echo [SUCCESS] ALL CHECKS PASSED!
    echo.
    echo Your ClassEcon monorepo is ready for Railway deployment!
    echo.
    echo Next steps:
    echo 1. Review RAILWAY_DEPLOYMENT_GUIDE.md
    echo 2. Generate JWT secrets
    echo 3. Set up MongoDB Atlas
    echo 4. Deploy to Railway
    echo.
    exit /b 0
) else (
    echo [FAILED] %ERRORS% ERROR(S) FOUND
    echo.
    echo Please fix the errors above before deploying.
    echo.
    exit /b 1
)
