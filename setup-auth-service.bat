@echo off
REM Quick setup script for Auth Microservice migration (Windows)

echo ================================
echo ClassEcon Auth Microservice Setup
echo ================================
echo.

echo [1/4] Installing Auth Service dependencies...
cd AuthService
call pnpm install
if errorlevel 1 (
    echo Error: Failed to install dependencies
    exit /b 1
)
cd ..
echo [OK] Auth Service dependencies installed
echo.

echo [2/4] Generating secure keys...
echo This requires Node.js to be installed...
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set JWT_SECRET=%%i
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set REFRESH_JWT_SECRET=%%i
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set SERVICE_API_KEY=%%i
echo [OK] Keys generated
echo.

echo [3/4] Creating Auth Service .env file...
(
echo # Server Configuration
echo PORT=4001
echo CORS_ORIGIN=http://localhost:5173
echo.
echo # JWT Configuration
echo JWT_SECRET=%JWT_SECRET%
echo JWT_EXPIRES_IN=15m
echo.
echo REFRESH_JWT_SECRET=%REFRESH_JWT_SECRET%
echo REFRESH_JWT_EXPIRES_IN=7d
echo.
echo # API Keys for inter-service communication
echo SERVICE_API_KEY=%SERVICE_API_KEY%
) > AuthService\.env
echo [OK] Auth Service .env created
echo.

echo [4/4] Updating Backend .env file...
if exist Backend\.env (
    echo Warning: Backend\.env exists. Please manually add:
    echo   AUTH_SERVICE_URL=http://localhost:4001
    echo   SERVICE_API_KEY=%SERVICE_API_KEY%
) else (
    echo Backend\.env not found. Please create it manually.
)
echo.

echo ================================
echo Setup Complete!
echo ================================
echo.
echo Generated Keys (save these securely):
echo --------------------------------
echo JWT_SECRET=%JWT_SECRET%
echo REFRESH_JWT_SECRET=%REFRESH_JWT_SECRET%
echo SERVICE_API_KEY=%SERVICE_API_KEY%
echo.
echo Next Steps:
echo --------------------------------
echo 1. Start Auth Service:    cd AuthService ^&^& pnpm dev
echo 2. Start Backend:         cd Backend ^&^& pnpm dev
echo 3. Start Frontend:        cd Frontend ^&^& pnpm dev
echo.
echo Test Auth Service:
echo   curl http://localhost:4001/health
echo.
pause
