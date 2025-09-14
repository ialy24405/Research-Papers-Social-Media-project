# 🎯 Backend URL Configuration - Summary

## ✅ What We've Built

### 1. **Centralized Configuration** (`src/lib/config.ts`)

- Single source of truth for all backend URLs
- Environment-aware configuration
- Helper functions for different URL types:
  - `getBackendUrl()` - For static files (PDFs, images)
  - `getApiUrl()` - For API endpoints
  - `getUploadUrl()` - For uploaded files

### 2. **Environment Templates**

- `.env.development.example` - Local development
- `.env.staging.example` - Staging environment
- `.env.production.example` - Production environment

### 3. **Automated Setup Script**

- `npm run setup-env` - Interactive environment configuration
- Automatically creates `.env.local` based on environment choice
- Prompts for custom URLs in staging/production

### 4. **Updated Components**

- PDF viewer now uses centralized configuration
- API services use the new config system
- All URLs are environment-aware

## 🚀 Quick Start

### For Development:

```bash
npm run setup-env
# Select option 1 (Development)
npm run dev
```

### For Production:

```bash
npm run setup-env
# Select option 3 (Production)
# Enter your production URLs when prompted
npm run build
npm start
```

## 🌍 Deployment Examples

### Vercel/Netlify

```bash
NEXT_PUBLIC_API_URL=https://your-api.com/api
NEXT_PUBLIC_SERVER_URL=https://your-api.com
```

### Docker

```dockerfile
ENV NEXT_PUBLIC_API_URL=https://backend.domain.com/api
ENV NEXT_PUBLIC_SERVER_URL=https://backend.domain.com
```

### Same Domain

```bash
NEXT_PUBLIC_API_URL=https://myapp.com/api
NEXT_PUBLIC_SERVER_URL=https://myapp.com
```

## 📁 Files Modified/Created

### New Files:

- `src/lib/config.ts` - Centralized configuration
- `.env.*.example` - Environment templates
- `scripts/setup-env.js` - Setup automation
- `DEPLOYMENT_CONFIG.md` - Detailed deployment guide

### Updated Files:

- `src/app/(main)/papers/[id]/page.tsx` - PDF viewer
- `src/lib/api/config.ts` - API configuration
- `package.json` - Added setup script
- `README.md` - Added configuration section

## 🔧 Easy Changes for Deployment

**Just update these 2 environment variables:**

1. `NEXT_PUBLIC_API_URL` - Your backend API URL
2. `NEXT_PUBLIC_SERVER_URL` - Your backend server URL (for PDFs)

Everything else is handled automatically! 🎉
