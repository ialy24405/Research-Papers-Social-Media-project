#!/bin/bash

# EC2 Deployment Script for Papers Project - Amazon Linux Version
# Run this script on your Amazon Linux EC2 instance

set -e  # Exit on any error

echo "=========================================="
echo "  Papers Project - EC2 Deployment"
echo "  Amazon Linux Version"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install Node.js
echo -e "${GREEN}Step 1: Installing Node.js...${NC}"
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"
echo ""

# Step 2: Install PostgreSQL
echo -e "${GREEN}Step 2: Installing PostgreSQL...${NC}"
sudo yum install -y postgresql15 postgresql15-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
echo -e "${GREEN}✓ PostgreSQL installed${NC}"
echo ""

# Step 3: Setup Database
echo -e "${GREEN}Step 3: Setting up database...${NC}"
sudo -u postgres psql -c "CREATE DATABASE scholarstream;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'scholarstream123';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scholarstream TO postgres;"
sudo -u postgres psql -c "ALTER USER postgres WITH SUPERUSER;"

# Configure PostgreSQL to allow password authentication
echo -e "${GREEN}Configuring PostgreSQL authentication...${NC}"
sudo sed -i 's/ident/md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/peer/md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql
echo -e "${GREEN}✓ Database setup complete${NC}"
echo ""

# Step 4: Run database migrations
echo -e "${GREEN}Step 4: Running database migrations...${NC}"
if [ -f "database_setup.sql" ]; then
    PGPASSWORD=scholarstream123 psql -h localhost -U postgres -d scholarstream < database_setup.sql
    echo -e "${GREEN}✓ Database migrations complete${NC}"
else
    echo -e "${YELLOW}⚠ database_setup.sql not found, skipping migrations${NC}"
fi
echo ""

# Step 5: Install PM2
echo -e "${GREEN}Step 5: Installing PM2...${NC}"
sudo npm install -g pm2
echo -e "${GREEN}✓ PM2 installed${NC}"
echo ""

# Step 6: Install project dependencies
echo -e "${GREEN}Step 6: Installing project dependencies...${NC}"

# Frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo -e "${GREEN}✓ All dependencies installed${NC}"
echo ""

# Step 7: Build the application
echo -e "${GREEN}Step 7: Building Next.js application...${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Step 8: Create logs directory
echo -e "${GREEN}Step 8: Creating logs directory...${NC}"
mkdir -p logs
echo -e "${GREEN}✓ Logs directory created${NC}"
echo ""

# Step 9: Start applications with PM2
echo -e "${GREEN}Step 9: Starting applications with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
echo -e "${GREEN}✓ Applications started${NC}"
echo ""

# Step 10: Display status
echo -e "${GREEN}Step 10: Checking status...${NC}"
pm2 status
echo ""

echo "=========================================="
echo -e "${GREEN}  Deployment Complete! ✓${NC}"
echo "=========================================="
echo ""
echo "Your application is now running:"
echo -e "  Frontend: ${GREEN}http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000${NC}"
echo -e "  Backend:  ${GREEN}http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3005${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 logs          - View logs"
echo "  pm2 status        - Check status"
echo "  pm2 restart all   - Restart apps"
echo "  pm2 monit         - Monitor resources"
echo ""
echo -e "${YELLOW}Don't forget to configure AWS Security Groups!${NC}"
echo "Allow inbound traffic on ports 3000 and 3005"
echo ""
