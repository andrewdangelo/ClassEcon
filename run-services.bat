@echo off
REM run-services.bat - open separate cmd windows for each service and run their dev scripts
SETLOCAL ENABLEDELAYEDEXPANSION
set ROOT=%~dp0

echo Starting services from %ROOT%

call :startService "Admin" "admin"
call :startService "AuthService" "AuthService"
call :startService "Backend" "Backend"
call :startService "EmailService" "EmailService"
call :startService "Frontend" "Frontend"
call :startService "LandingPage" "LandingPage"
call :startService "PaymentService" "PaymentService"

echo Launched all available services.
goto :eof

:startService
set "title=%~1"
set "dir=%~2"
if not exist "%ROOT%%dir%\" (
  echo Skipping %title%: directory not found: %dir%
  goto :eof
)

start "%title%" cmd /k "cd /d "%ROOT%%dir%" && pnpm dev || npm run dev || npm start || (echo No dev script found in %dir% & pause)"
goto :eof
