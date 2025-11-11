# AWS Deployment Steps - Option A: S3 + EC2

## ✅ What We've Done So Far

1. ✅ Updated `next.config.ts` for static export
2. ✅ Created `.env.production.local` template
3. ✅ Your API configuration is ready to use external backend

## 📋 Next Steps

### Step 1: Update Your Environment File (Do This NOW)

Open `.env.production.local` and replace `YOUR_EC2_IP` with your actual EC2 instance public IP:

```bash
# Find your EC2 public IP in AWS Console:
# EC2 Dashboard → Instances → Your Instance → Public IPv4 address

# Example:
NEXT_PUBLIC_API_URL=http://54.123.45.67:5000/api
NEXT_PUBLIC_SERVER_URL=http://54.123.45.67:5000
```

### Step 2: Build Frontend for S3

Run these commands in PowerShell:

```powershell
# Navigate to your project
cd E:\Fatma\papers-project

# Install dependencies (if not already done)
npm install

# Build static site
npm run build

# This will create an 'out' folder with your static files
```

**⚠️ IMPORTANT**: If the build fails with errors about API routes, that's expected! We'll handle that next.

### Step 3: Handle Next.js API Routes (CRITICAL)

Since Next.js API routes (`/pages/api/`) don't work with static export, you have two options:

#### Option 3a: Keep API Routes in Next.js (Easier - RECOMMENDED)

Instead of deploying frontend to S3, deploy the ENTIRE Next.js app to EC2:
- Frontend pages will be server-rendered on EC2
- API routes will work normally
- Much simpler deployment

**If you choose this, I'll guide you through deploying everything to EC2 (which I actually recommend for your setup).**

#### Option 3b: Move API Routes to Separate Express Backend (Complex)

You'll need to:
1. Create a separate Express.js backend project
2. Move all API logic from `/pages/api/` to Express routes
3. Update all API calls in frontend to use external backend
4. Deploy backend to EC2
5. Deploy frontend to S3

**This requires significant refactoring. Do you want to proceed with this?**

---

## 🤔 Decision Point: Which Approach?

### **OPTION A: Full Next.js on EC2 (RECOMMENDED)**
✅ Much simpler
✅ No code changes needed
✅ Works with your current setup
✅ Keeps API routes functional
❌ No S3 (but you can add CloudFront later)

### **OPTION B: Split Architecture (S3 + EC2)**
✅ Clear separation of concerns
✅ Frontend on CDN (faster)
❌ Requires refactoring all API routes
❌ More complex deployment
❌ More time-consuming

---

## 🚀 Quick Test: Try Building First

Let's see if your project can build as static:

```powershell
npm run build
```

**If you see errors like:**
- "API routes cannot be used with output: export"
- "getServerSideProps cannot be used with output: export"

**Then you MUST choose Option A (Full Next.js on EC2) OR do major refactoring.**

---

## 📞 Next Steps - Tell Me:

1. **Did the build succeed or fail?**
2. **Which approach do you prefer?**
   - A: Deploy everything to EC2 (simpler)
   - B: Split to S3 + EC2 (more work)

Based on your answer, I'll provide the exact commands and steps to continue!
