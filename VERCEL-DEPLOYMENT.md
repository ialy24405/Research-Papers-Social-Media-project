# Vercel Deployment Setup Instructions

## 🎯 Environment Variables Needed

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required Variables:

```
POSTGRES_URL = your-supabase-connection-string
JWT_SECRET = a8f5f167f44f4964e6c998dee827110c7b8a9d6e5f4c3b2a1098f7e6d5c4b3a2
JWT_EXPIRES_IN = 24h
NODE_ENV = production
NEXT_PUBLIC_API_URL = /api
NEXT_PUBLIC_SERVER_URL =
```

### Supabase Connection String Format:

```
postgresql://postgres:YOUR-PASSWORD@db.xxx.supabase.co:5432/postgres
```

## 🚀 Deployment Steps:

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Set Environment Variables in Vercel**

3. **Deploy:**

   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

4. **Test Endpoints:**
   - `/api` - API status
   - `/api/categories` - Categories list
   - `/api/papers` - Papers list
   - Try registration at `/register`

## 📋 Database Schema:

Run the SQL from `backend/src/config/schema.sql` in your Supabase project.
