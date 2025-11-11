# 🚀 Quick Start - EC2 Deployment

## What You Need
- ✅ EC2 Instance: `98.94.137.180`
- ✅ PuTTY connected
- ✅ Environment files configured

## 3-Step Deployment

### Step 1: Upload Project to EC2

**Option A - Using Git (Recommended):**
```bash
# On your EC2 instance (via PuTTY)
cd ~
git clone https://github.com/ialy24405/Research-Papers-Social-Media-project.git
cd Research-Papers-Social-Media-project
```

**Option B - Using SCP/FileZilla:**
- Use WinSCP or FileZilla to upload the entire project folder
- Server: `98.94.137.180`
- Protocol: SFTP
- Upload to: `/home/ubuntu/Research-Papers-Social-Media-project`

---

### Step 2: Run Deployment Script

```bash
# Make script executable
chmod +x deploy-ec2.sh

# Run the deployment script
./deploy-ec2.sh
```

**The script will automatically:**
- ✅ Install Node.js 20.x
- ✅ Install PostgreSQL
- ✅ Create database and user
- ✅ Run database migrations
- ✅ Install PM2 process manager
- ✅ Install all npm dependencies (frontend + backend)
- ✅ Build Next.js application
- ✅ Start both frontend and backend with PM2

**Total time: ~5-10 minutes**

---

### Step 3: Configure AWS Security Groups

1. Go to **AWS Console** → **EC2** → **Instances**
2. Click your instance → **Security** tab → Click the Security Group
3. Click **Edit inbound rules** → **Add rule**:

   | Type       | Port | Source      | Description |
   |------------|------|-------------|-------------|
   | Custom TCP | 3000 | 0.0.0.0/0   | Frontend    |
   | Custom TCP | 3005 | 0.0.0.0/0   | Backend     |
   | SSH        | 22   | My IP       | SSH Access  |

4. Click **Save rules**

---

## 🎉 Test Your Deployment

Open in browser:
- **Frontend:** `http://98.94.137.180:3000`
- **Backend API:** `http://98.94.137.180:3005/api/health`

---

## 📊 Monitoring Commands

```bash
# Check status
pm2 status

# View logs (all apps)
pm2 logs

# View frontend logs only
pm2 logs frontend

# View backend logs only
pm2 logs backend

# Real-time monitoring
pm2 monit

# Restart apps
pm2 restart all
```

---

## 🔧 Troubleshooting

### If deployment script fails:

1. **Check Node.js version:**
   ```bash
   node --version  # Should be v20.x
   ```

2. **Check PostgreSQL:**
   ```bash
   sudo systemctl status postgresql
   ```

3. **Check ports:**
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :3005
   ```

4. **Manual start:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

### If apps won't start:

```bash
# Check logs
pm2 logs --lines 50

# Delete and restart
pm2 delete all
pm2 start ecosystem.config.js
```

---

## 🔄 Update/Redeploy

```bash
cd ~/Research-Papers-Social-Media-project

# Pull latest changes
git pull

# Install any new dependencies
npm install
cd backend && npm install && cd ..

# Rebuild
npm run build

# Restart
pm2 restart all
```

---

## 📝 Environment Files Checklist

✅ `.env.production.local` - Frontend environment (already configured)
✅ `backend/.env.production` - Backend environment (already created)
✅ `ecosystem.config.js` - PM2 configuration (already created)

---

## 🌐 Optional: Setup Nginx (Cleaner URLs)

After basic deployment works, you can setup Nginx to:
- Access via port 80 (no :3000 in URL)
- Reverse proxy both frontend and backend
- Add SSL/HTTPS later

See `EC2_DEPLOYMENT_GUIDE.md` Part 7 for Nginx setup.

---

## 📞 Need Help?

Check `EC2_DEPLOYMENT_GUIDE.md` for detailed instructions and advanced configuration.
