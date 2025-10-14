#!/bin/bash
# Quick setup script for Auth Microservice migration

set -e

echo "🚀 ClassEcon Auth Microservice Setup"
echo "====================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to generate random key
generate_key() {
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
}

echo "📦 Step 1: Installing Auth Service dependencies..."
cd AuthService
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm not found, using npm...${NC}"
    npm install
else
    pnpm install
fi
cd ..
echo -e "${GREEN}✓ Auth Service dependencies installed${NC}"
echo ""

echo "🔐 Step 2: Generating secure keys..."
JWT_SECRET=$(generate_key)
REFRESH_JWT_SECRET=$(generate_key)
SERVICE_API_KEY=$(generate_key)
echo -e "${GREEN}✓ Keys generated${NC}"
echo ""

echo "📝 Step 3: Creating Auth Service .env file..."
cat > AuthService/.env << EOF
# Server Configuration
PORT=4001
CORS_ORIGIN=http://localhost:5173

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=15m

REFRESH_JWT_SECRET=${REFRESH_JWT_SECRET}
REFRESH_JWT_EXPIRES_IN=7d

# API Keys for inter-service communication
SERVICE_API_KEY=${SERVICE_API_KEY}
EOF
echo -e "${GREEN}✓ Auth Service .env created${NC}"
echo ""

echo "📝 Step 4: Updating Backend .env file..."
if [ -f Backend/.env ]; then
    # Backup existing .env
    cp Backend/.env Backend/.env.backup
    echo -e "${YELLOW}⚠ Backed up existing Backend/.env to Backend/.env.backup${NC}"
    
    # Add new variables if they don't exist
    if ! grep -q "AUTH_SERVICE_URL" Backend/.env; then
        echo "" >> Backend/.env
        echo "# Auth Service Configuration" >> Backend/.env
        echo "AUTH_SERVICE_URL=http://localhost:4001" >> Backend/.env
        echo "SERVICE_API_KEY=${SERVICE_API_KEY}" >> Backend/.env
    fi
    echo -e "${GREEN}✓ Backend .env updated${NC}"
else
    echo -e "${RED}✗ Backend/.env not found. Please create it manually.${NC}"
fi
echo ""

echo "✅ Setup Complete!"
echo ""
echo "🔑 Generated Keys (save these securely):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "JWT_SECRET=${GREEN}${JWT_SECRET}${NC}"
echo -e "REFRESH_JWT_SECRET=${GREEN}${REFRESH_JWT_SECRET}${NC}"
echo -e "SERVICE_API_KEY=${GREEN}${SERVICE_API_KEY}${NC}"
echo ""
echo "🚀 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Start Auth Service:    cd AuthService && pnpm dev"
echo "2. Start Backend:         cd Backend && pnpm dev"
echo "3. Start Frontend:        cd Frontend && pnpm dev"
echo ""
echo "📚 Documentation:"
echo "   - AuthService/README.md"
echo "   - AUTH_MICROSERVICE_MIGRATION.md"
echo ""
echo "🧪 Test Auth Service:"
echo "   curl http://localhost:4001/health"
