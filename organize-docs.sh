#!/bin/bash

# Documentation Organization Script
# This script moves documentation files into organized directories

echo "📚 Organizing ClassEcon Documentation..."
echo ""

# Create docs directory structure if it doesn't exist
mkdir -p docs/authentication
mkdir -p docs/features
mkdir -p docs/guides
mkdir -p docs/fixes
mkdir -p docs/archive

# Move Authentication Documentation
echo "🔐 Moving authentication docs..."
mv AUTH_ARCHITECTURE.md docs/authentication/ 2>/dev/null
mv AUTH_MICROSERVICE_MIGRATION.md docs/authentication/ 2>/dev/null
mv AUTH_QUICK_REFERENCE.md docs/authentication/ 2>/dev/null
mv AUTH_REFACTOR_SUMMARY.md docs/authentication/ 2>/dev/null
mv AUTH_TESTING_GUIDE.md docs/authentication/ 2>/dev/null
mv OAUTH_IMPLEMENTATION_SUMMARY.md docs/authentication/ 2>/dev/null
mv OAUTH_QUICK_START.md docs/authentication/ 2>/dev/null
mv OAUTH_SETUP_GUIDE.md docs/authentication/ 2>/dev/null

# Move Feature Documentation
echo "🎯 Moving feature docs..."
mv JOB_SYSTEM_QUICK_START.md docs/features/ 2>/dev/null
mv JOB_SYSTEM_SUMMARY.md docs/features/ 2>/dev/null
mv BACKPACK_FRONTEND_SUMMARY.md docs/features/ 2>/dev/null
mv BACKPACK_IMPLEMENTATION_GUIDE.md docs/features/ 2>/dev/null
mv REDEMPTION_SYSTEM_IMPROVEMENTS.md docs/features/ 2>/dev/null
mv NOTIFICATION_FIX_SUMMARY.md docs/features/ 2>/dev/null
mv TEACHER_DASHBOARD_GUIDE.md docs/features/ 2>/dev/null
mv STUDENT_DETAIL_SUMMARY.md docs/features/ 2>/dev/null
mv DASHBOARD_ENHANCEMENTS.md docs/features/ 2>/dev/null

# Move Guide Documentation
echo "📖 Moving guide docs..."
mv TESTING_GUIDE.md docs/guides/ 2>/dev/null
mv NOTIFICATION_DEBUG_GUIDE.md docs/guides/ 2>/dev/null
mv ONBOARDING_REDESIGN_SUMMARY.md docs/guides/ 2>/dev/null

# Move Fix Documentation
echo "🔧 Moving fix docs..."
mv PURCHASE_AND_PAYMENT_FIXES.md docs/fixes/ 2>/dev/null
mv ENUM_FORMAT_FIX.md docs/fixes/ 2>/dev/null
mv NULL_STOREITEM_FIX.md docs/fixes/ 2>/dev/null
mv ITEMID_COMPATIBILITY_FIX.md docs/fixes/ 2>/dev/null
mv BACKPACK_REDEMPTION_UI_FIXES.md docs/fixes/ 2>/dev/null
mv THEME_NOTIFICATION_SUMMARY.md docs/fixes/ 2>/dev/null

# Move Archive Documentation (historical notes)
echo "📦 Moving archive docs..."
mv CHANGES_SUMMARY.md docs/archive/ 2>/dev/null
mv SESSION_2_SUMMARY.md docs/archive/ 2>/dev/null

# Keep these in root
echo "📌 Keeping in root directory:"
echo "   - README.md (main entry point)"
echo "   - DEVELOPER_DOCUMENTATION.md (comprehensive guide)"
echo "   - ARCHITECTURE_DIAGRAMS.md (system architecture)"
echo "   - TODO.md (task list)"
echo ""

echo "✅ Documentation organization complete!"
echo ""
echo "📂 Documentation structure:"
echo "   docs/"
echo "   ├── authentication/    (8 files)"
echo "   ├── features/          (9 files)"
echo "   ├── guides/            (3 files)"
echo "   ├── fixes/             (6 files)"
echo "   └── archive/           (2 files)"
echo ""
echo "📖 Start reading: README.md or DEVELOPER_DOCUMENTATION.md"
