#!/bin/bash

# AI Resume ATS Checker - Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "=========================================="
echo "  AI Resume ATS Checker - Setup Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}Warning: PostgreSQL CLI not found${NC}"
    echo "You'll need to create the database manually or use a cloud provider"
else
    echo -e "${GREEN}✓ PostgreSQL detected${NC}"
fi

echo ""
echo "=========================================="
echo "  Step 1: Installing Dependencies"
echo "=========================================="
npm install

echo ""
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo "=========================================="
echo "  Step 2: Environment Configuration"
echo "=========================================="

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file from template${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANT: Please edit .env file with your configuration:${NC}"
    echo "  1. Set DATABASE_URL"
    echo "  2. Set JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "  3. Set JWT_REFRESH_SECRET (generate with: openssl rand -base64 32)"
    echo ""
    read -p "Press Enter after configuring .env file..."
else
    echo -e "${YELLOW}⚠ .env file already exists, skipping...${NC}"
fi

echo ""
echo "=========================================="
echo "  Step 3: Database Setup"
echo "=========================================="

read -p "Do you want to create a local PostgreSQL database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter database name (default: ats_checker): " DB_NAME
    DB_NAME=${DB_NAME:-ats_checker}
    
    echo "Creating database: $DB_NAME"
    createdb $DB_NAME 2>/dev/null || echo "Database might already exist"
    
    # Update .env with local database URL
    if grep -q "DATABASE_URL=" .env; then
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://localhost:5432/$DB_NAME\"|g" .env
        echo -e "${GREEN}✓ Updated DATABASE_URL in .env${NC}"
    fi
fi

echo ""
echo "Generating Prisma client..."
npm run db:generate

echo ""
echo "Pushing database schema..."
npm run db:push

echo -e "${GREEN}✓ Database setup complete${NC}"

echo ""
echo "=========================================="
echo "  Step 4: Generating JWT Secrets"
echo "=========================================="

if command -v openssl &> /dev/null; then
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH=$(openssl rand -base64 32)
    
    echo "Generated secrets (update in .env):"
    echo "JWT_SECRET=$JWT_SECRET"
    echo "JWT_REFRESH_SECRET=$JWT_REFRESH"
    echo ""
    
    read -p "Update .env with generated secrets? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|g" .env
        sed -i.bak "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=\"$JWT_REFRESH\"|g" .env
        echo -e "${GREEN}✓ Secrets updated in .env${NC}"
    fi
else
    echo -e "${YELLOW}⚠ OpenSSL not found. Generate secrets manually:${NC}"
    echo "Run: openssl rand -base64 32"
fi

echo ""
echo "=========================================="
echo "  Setup Complete! 🎉"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Review .env file"
echo "  2. Run: npm run dev"
echo "  3. Visit: http://localhost:3000"
echo ""
echo "Documentation:"
echo "  - README.md: Complete documentation"
echo "  - QUICKSTART.md: Quick setup guide"
echo "  - API_DOCUMENTATION.md: API reference"
echo "  - DEPLOYMENT.md: Deployment guide"
echo ""
echo "Happy coding! 🚀"
