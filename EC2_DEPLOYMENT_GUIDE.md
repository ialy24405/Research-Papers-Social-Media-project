# EC2 Deployment Guide

## Overview
Deploy the entire Next.js application (frontend + API routes + backend) on AWS EC2.

**Your EC2 IP:** `98.94.137.180`

---

## Part 1: Prepare Your Local Project

### 1. Create backend environment file on EC2

Create a file called `backend/.env.production` with these contents:

```bash
# Environment Configuration
NODE_ENV=production
PORT=3005

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scholarstream
DB_USER=postgres
DB_PASSWORD=scholarstream123

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_to_something_very_long_and_random_in_production_12345678901234567890
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10485760

# CORS Configuration
CORS_ORIGIN=http://98.94.137.180:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pklwkpztjrlstoxymrsn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbHdrcHp0anJsc3RveHltcnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NTc2NDYsImV4cCI6MjA3MzUzMzY0Nn0.SgrGxYjJz3f8g8Sn_48nEOmLf7u5J2ZAI-KYkGT9gtM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbHdrcHp0anJsc3RveHltcnNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzk1NzY0NiwiZXhwIjoyMDczNTMzNjQ2fQ.rfkh_TYNetLInoQAoFdH2HxZJf_o2YJu5HVAC9txlDw
```

---

## Part 2: Setup EC2 Instance

### 1. Connect to EC2 via PuTTY
You're already connected ✓

### 2. Install Node.js and npm

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE scholarstream;"
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'scholarstream123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scholarstream TO postgres;"
sudo -u postgres psql -c "ALTER USER postgres WITH SUPERUSER;"
```

### 4. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 5. Install Git

```bash
sudo apt install -y git
```

---

## Part 3: Deploy Your Application

### 1. Clone your repository to EC2

```bash
cd ~
git clone https://github.com/ialy24405/Research-Papers-Social-Media-project.git
cd Research-Papers-Social-Media-project
```

### 2. Setup Database

```bash
# Run database setup script
sudo -u postgres psql scholarstream < database_setup.sql
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env .env.production
# (Then edit .env.production with the values from Part 1)

cd ..
```

### 4. Setup Frontend

```bash
# Install dependencies
npm install

# Copy your production environment file
# (Upload .env.production.local from your local machine)
```

### 5. Build the application

```bash
# Build Next.js app
npm run build
```

---

## Part 4: Run with PM2

### 1. Create PM2 ecosystem file

Create `ecosystem.config.js` in the project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    }
  ]
};
```

### 2. Start applications with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Check status

```bash
pm2 status
pm2 logs
```

---

## Part 5: Configure AWS Security Groups

### Allow inbound traffic:

1. Go to AWS Console → EC2 → Security Groups
2. Select your EC2 instance's security group
3. Edit Inbound Rules:
   - **Type:** Custom TCP
   - **Port:** 3000
   - **Source:** 0.0.0.0/0 (or your IP)
   - **Description:** Frontend

   - **Type:** Custom TCP
   - **Port:** 3005
   - **Source:** 0.0.0.0/0 (or your IP)
   - **Description:** Backend

   - **Type:** SSH
   - **Port:** 22
   - **Source:** Your IP
   - **Description:** SSH Access

---

## Part 6: Test Your Deployment

### Access your application:

- **Frontend:** http://98.94.137.180:3000
- **Backend API:** http://98.94.137.180:3005/api
- **Health Check:** http://98.94.137.180:3005/api/health

---

## Part 7: Setup Nginx (Optional - Recommended)

### 1. Install Nginx

```bash
sudo apt install -y nginx
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/papers-project`:

```nginx
server {
    listen 80;
    server_name 98.94.137.180;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable site

```bash
sudo ln -s /etc/nginx/sites-available/papers-project /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Now you can access via: http://98.94.137.180

---

## Useful PM2 Commands

```bash
pm2 list                 # List all processes
pm2 logs                 # View logs
pm2 logs frontend        # View frontend logs only
pm2 logs backend         # View backend logs only
pm2 restart all          # Restart all apps
pm2 restart frontend     # Restart frontend only
pm2 stop all             # Stop all apps
pm2 delete all           # Delete all apps
pm2 monit                # Monitor CPU/Memory
```

---

## Troubleshooting

### Check if ports are in use:
```bash
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3005
```

### Check PostgreSQL status:
```bash
sudo systemctl status postgresql
```

### View application logs:
```bash
pm2 logs --lines 100
```

### Check Nginx errors:
```bash
sudo tail -f /var/log/nginx/error.log
```

---

## Update/Redeploy

```bash
cd ~/Research-Papers-Social-Media-project
git pull
npm install
npm run build
pm2 restart all
```

---

## Next Steps After Deployment

1. **Get a domain name** (optional)
2. **Setup SSL/HTTPS** with Let's Encrypt
3. **Configure CloudFront** for CDN (optional)
4. **Setup automated backups** for database
5. **Configure monitoring** (CloudWatch, Datadog, etc.)
