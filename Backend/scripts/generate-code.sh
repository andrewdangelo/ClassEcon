#!/bin/bash

# Quick Beta Code Generator
# This script creates a beta access code directly in MongoDB
# Usage: ./generate-code.sh [CODE] [DESCRIPTION] [MAX_USES]

CODE=${1:-BETA2024}
DESCRIPTION=${2:-"Beta access code"}
MAX_USES=${3:-10}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎫 Creating Beta Access Code"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Code: $CODE"
echo "📝 Description: $DESCRIPTION"
echo "🔢 Max Uses: $MAX_USES"
echo ""

# Check if mongosh is available
if command -v mongosh &> /dev/null; then
    MONGO_CMD="mongosh"
elif command -v mongo &> /dev/null; then
    MONGO_CMD="mongo"
else
    echo "❌ MongoDB CLI not found in PATH"
    echo ""
    echo "📋 Manual Instructions:"
    echo ""
    echo "1. Open MongoDB Compass or your MongoDB client"
    echo "2. Connect to: mongodb://localhost:27017/classecon"
    echo "3. Navigate to 'betaaccesscodes' collection"
    echo "4. Insert this document:"
    echo ""
    echo "{"
    echo "  \"code\": \"$CODE\","
    echo "  \"description\": \"$DESCRIPTION\","
    echo "  \"maxUses\": $MAX_USES,"
    echo "  \"currentUses\": 0,"
    echo "  \"isActive\": true,"
    echo "  \"usedBy\": [],"
    echo "  \"createdAt\": new Date()"
    echo "}"
    echo ""
    exit 1
fi

# Create the beta code
$MONGO_CMD classecon --quiet --eval "
db.betaaccesscodes.insertOne({
  code: '$CODE',
  description: '$DESCRIPTION',
  maxUses: $MAX_USES,
  currentUses: 0,
  isActive: true,
  usedBy: [],
  createdAt: new Date()
})
" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Beta code created successfully!"
    echo ""
    echo "🎉 You can now use code: $CODE"
else
    echo "❌ Failed to create beta code"
    echo "Make sure MongoDB is running: mongod"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
