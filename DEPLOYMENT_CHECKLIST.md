# 📋 EC2 Deployment Checklist

## Pre-Deployment (On Your Local Machine)
- [x] EC2 instance created (IP: 98.94.137.180)
- [x] S3 bucket created
- [x] PuTTY connected to EC2
- [x] Environment files configured
  - [x] `.env.production.local` (frontend)
  - [x] `backend/.env.production` (backend)
  - [x] `ecosystem.config.js` (PM2 config)
- [x] Supabase credentials added
- [x] next.config.ts reverted to "standalone" mode

## Deployment Steps (On EC2 Instance)

### 1. Upload Project to EC2
- [ ] Clone repository OR upload via SCP/FileZilla
  ```bash
  git clone https://github.com/ialy24405/Research-Papers-Social-Media-project.git
  cd Research-Papers-Social-Media-project
  ```

### 2. Run Deployment Script
- [ ] Make script executable
  ```bash
  chmod +x deploy-ec2.sh
  ```
- [ ] Run deployment script
  ```bash
  ./deploy-ec2.sh
  ```
- [ ] Wait for script to complete (~5-10 minutes)

### 3. Configure AWS Security Groups
- [ ] Go to AWS Console → EC2 → Security Groups
- [ ] Edit inbound rules:
  - [ ] Allow port 3000 (Frontend)
  - [ ] Allow port 3005 (Backend)
  - [ ] Allow port 22 (SSH)
- [ ] Save rules

### 4. Test Deployment
- [ ] Open browser and test:
  - [ ] Frontend: http://98.94.137.180:3000
  - [ ] Backend: http://98.94.137.180:3005/api/health
- [ ] Test login functionality
- [ ] Test paper upload
- [ ] Check PM2 status: `pm2 status`

## Post-Deployment (Optional)

### 5. Setup Nginx (Recommended)
- [ ] Install Nginx
  ```bash
  sudo apt install -y nginx
  ```
- [ ] Configure Nginx (see EC2_DEPLOYMENT_GUIDE.md Part 7)
- [ ] Enable site and restart Nginx
- [ ] Test: http://98.94.137.180 (port 80)

### 6. Additional Configuration
- [ ] Get domain name (optional)
- [ ] Setup SSL/HTTPS with Let's Encrypt (optional)
- [ ] Configure CloudFront CDN (optional)
- [ ] Setup database backups
- [ ] Configure monitoring (CloudWatch)

## Troubleshooting Steps

If something doesn't work:

### Check Node.js
```bash
node --version  # Should be v20.x
npm --version
```

### Check PostgreSQL
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

### Check PM2 Status
```bash
pm2 status
pm2 logs
pm2 logs frontend --lines 50
pm2 logs backend --lines 50
```

### Check Ports
```bash
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3005
```

### Manual Restart
```bash
pm2 restart all
pm2 save
```

## Useful Commands Reference

### PM2 Commands
```bash
pm2 status              # Check status
pm2 logs                # View all logs
pm2 logs frontend       # Frontend logs only
pm2 logs backend        # Backend logs only
pm2 monit               # Real-time monitoring
pm2 restart all         # Restart all apps
pm2 restart frontend    # Restart frontend only
pm2 restart backend     # Restart backend only
pm2 stop all            # Stop all apps
pm2 delete all          # Delete all apps
pm2 save                # Save current process list
```

### System Commands
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check system info
uname -a
```

### Database Commands
```bash
# Connect to database
sudo -u postgres psql scholarstream

# List tables
\dt

# Exit
\q
```

## Files You Should Have

### Root Directory
- [x] `EC2_DEPLOYMENT_GUIDE.md` - Full deployment guide
- [x] `QUICK_START_EC2.md` - Quick start guide
- [x] `DEPLOYMENT_CHECKLIST.md` - This file
- [x] `ecosystem.config.js` - PM2 configuration
- [x] `deploy-ec2.sh` - Deployment script
- [x] `.env.production.local` - Frontend environment
- [x] `database_setup.sql` - Database schema

### Backend Directory
- [x] `backend/.env.production` - Backend environment

## Success Indicators

✅ Deployment is successful when:
- [ ] `pm2 status` shows both apps as "online"
- [ ] Frontend loads at http://98.94.137.180:3000
- [ ] Backend responds at http://98.94.137.180:3005/api/health
- [ ] You can register/login
- [ ] You can upload papers
- [ ] You can view papers
- [ ] No errors in `pm2 logs`

## Support

- **Detailed Guide:** `EC2_DEPLOYMENT_GUIDE.md`
- **Quick Start:** `QUICK_START_EC2.md`
- **PM2 Documentation:** https://pm2.keymetrics.io/
- **AWS EC2 Docs:** https://docs.aws.amazon.com/ec2/

---

## Next Steps After Deployment

1. **Monitor for 24 hours** - Check logs regularly
2. **Test all features** - Login, upload, search, etc.
3. **Setup Nginx** - For cleaner URLs (optional)
4. **Get SSL certificate** - For HTTPS (recommended)
5. **Setup backups** - Database and uploaded files
6. **Configure monitoring** - AWS CloudWatch or similar

---

**Current Status:** Ready to deploy! 🚀

Start with Step 1: Upload project to EC2 instance.
