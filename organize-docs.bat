@echo off
REM Documentation Organization Script for Windows
REM This script moves documentation files into organized directories

echo 📚 Organizing ClassEcon Documentation...
echo.

REM Create docs directory structure if it doesn't exist
if not exist "docs\authentication" mkdir "docs\authentication"
if not exist "docs\features" mkdir "docs\features"
if not exist "docs\guides" mkdir "docs\guides"
if not exist "docs\fixes" mkdir "docs\fixes"
if not exist "docs\archive" mkdir "docs\archive"

REM Move Authentication Documentation
echo 🔐 Moving authentication docs...
move AUTH_ARCHITECTURE.md docs\authentication\ 2>nul
move AUTH_MICROSERVICE_MIGRATION.md docs\authentication\ 2>nul
move AUTH_QUICK_REFERENCE.md docs\authentication\ 2>nul
move AUTH_REFACTOR_SUMMARY.md docs\authentication\ 2>nul
move AUTH_TESTING_GUIDE.md docs\authentication\ 2>nul
move OAUTH_IMPLEMENTATION_SUMMARY.md docs\authentication\ 2>nul
move OAUTH_QUICK_START.md docs\authentication\ 2>nul
move OAUTH_SETUP_GUIDE.md docs\authentication\ 2>nul

REM Move Feature Documentation
echo 🎯 Moving feature docs...
move JOB_SYSTEM_QUICK_START.md docs\features\ 2>nul
move JOB_SYSTEM_SUMMARY.md docs\features\ 2>nul
move BACKPACK_FRONTEND_SUMMARY.md docs\features\ 2>nul
move BACKPACK_IMPLEMENTATION_GUIDE.md docs\features\ 2>nul
move REDEMPTION_SYSTEM_IMPROVEMENTS.md docs\features\ 2>nul
move NOTIFICATION_FIX_SUMMARY.md docs\features\ 2>nul
move TEACHER_DASHBOARD_GUIDE.md docs\features\ 2>nul
move STUDENT_DETAIL_SUMMARY.md docs\features\ 2>nul
move DASHBOARD_ENHANCEMENTS.md docs\features\ 2>nul

REM Move Guide Documentation
echo 📖 Moving guide docs...
move TESTING_GUIDE.md docs\guides\ 2>nul
move NOTIFICATION_DEBUG_GUIDE.md docs\guides\ 2>nul
move ONBOARDING_REDESIGN_SUMMARY.md docs\guides\ 2>nul

REM Move Fix Documentation
echo 🔧 Moving fix docs...
move PURCHASE_AND_PAYMENT_FIXES.md docs\fixes\ 2>nul
move ENUM_FORMAT_FIX.md docs\fixes\ 2>nul
move NULL_STOREITEM_FIX.md docs\fixes\ 2>nul
move ITEMID_COMPATIBILITY_FIX.md docs\fixes\ 2>nul
move BACKPACK_REDEMPTION_UI_FIXES.md docs\fixes\ 2>nul
move THEME_NOTIFICATION_SUMMARY.md docs\fixes\ 2>nul

REM Move Archive Documentation (historical notes)
echo 📦 Moving archive docs...
move CHANGES_SUMMARY.md docs\archive\ 2>nul
move SESSION_2_SUMMARY.md docs\archive\ 2>nul

echo.
echo 📌 Keeping in root directory:
echo    - README.md (main entry point)
echo    - DEVELOPER_DOCUMENTATION.md (comprehensive guide)
echo    - ARCHITECTURE_DIAGRAMS.md (system architecture)
echo    - TODO.md (task list)
echo.
echo ✅ Documentation organization complete!
echo.
echo 📂 Documentation structure:
echo    docs\
echo    ├── authentication\    (8 files)
echo    ├── features\          (9 files)
echo    ├── guides\            (3 files)
echo    ├── fixes\             (6 files)
echo    └── archive\           (2 files)
echo.
echo 📖 Start reading: README.md or DEVELOPER_DOCUMENTATION.md
echo.
pause
