# 🚀 How to Run Your Papers Project

This guide shows you different ways to run your site with automatic warmup to eliminate long compilation times.

## ⚡ Quick Start (Recommended)

### Option 1: Easy Batch Script (Windows)

Double-click: `scripts/start-development.bat`

Or run:

```cmd
scripts\start-development.bat
```

**What it does:**

- Starts Next.js development server in a new window
- Waits for server to be ready
- Automatically runs warmup
- Shows you when it's ready to use!

### Option 2: Manual Two-Step Process

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Wait 5 seconds, then warmup
npm run warmup:quick
```

### Option 3: Docker (Consistent Environment)

```bash
npm run docker:dev
```

## 🐳 Docker Options

### For Development

```bash
npm run docker:dev
```

### For Production (Optimized)

```bash
npm run docker:minimal
# or
npm run docker:ultra-slim
```

## 🔥 Warmup Options

### Quick Warmup (Essential pages only - 5-10 seconds)

```bash
npm run warmup:quick
```

Warms up: `/`, `/home`, `/login`, `/register`, `/categories`

### Full Warmup (All pages - 15-30 seconds)

```bash
npm run warmup
```

Warms up all routes including admin, profile, upload, etc.

## 📋 Step-by-Step Instructions

### 1. First Time Setup

```bash
# Install dependencies (only needed once)
npm install

# Start with auto-warmup
npm run dev:fast
```

### 2. Daily Development Workflow

```bash
# Quick start with warmup
npm run dev:fast
```

**Wait for this message:**

```
🎉 Development environment is ready!
📱 Open: http://localhost:3000
⚡ Pages should load instantly now!
```

### 3. Manual Warmup (if needed)

If you start the server manually:

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Wait 5 seconds, then warmup
npm run warmup:quick
```

## 🎯 What Gets Warmed Up

### Quick Warmup (`warmup:quick`)

- **Homepage** (`/`) - Landing page
- **Dashboard** (`/home`) - Main app page
- **Authentication** (`/login`, `/register`) - Login/signup
- **Categories** (`/categories`) - Browse categories

### Full Warmup (`warmup`)

- All quick warmup pages
- **Profile pages** (`/profile`, `/profile/saved`)
- **Upload** (`/upload`) - Paper upload
- **Admin** (`/admin`) - Admin dashboard
- **Posts** (`/posts/status`) - Post management
- **Category details** (e.g., `/categories/cs`, `/categories/bio`)
- **Sample papers** (e.g., `/papers/paper-1`)

## ⚡ Performance Results

### Before Warmup

- First page load: **3-13 seconds** (compilation needed)
- Subsequent pages: **2-8 seconds** each

### After Warmup

- All warmed pages: **< 500ms** (instant loading!)
- New pages: Still need compilation

## 🛠 Troubleshooting

### Server Won't Start

```bash
# Check if port 3000 is busy
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID_NUMBER> /F

# Try again
npm run dev:fast
```

### Warmup Fails

```bash
# Check if server is running
curl http://localhost:3000
# or
Invoke-WebRequest http://localhost:3000

# If server is running, try manual warmup
npm run warmup:quick
```

### Slow Compilation

```bash
# Use Turbopack (already enabled)
npm run dev

# Or try Docker for consistent performance
npm run docker:dev
```

## 🔧 Configuration Options

### Environment Variables

Create `.env.local` for custom settings:

```bash
# Custom warmup target
BASE_URL=http://localhost:3001

# Development settings
NEXT_TELEMETRY_DISABLED=1
```

### Custom Warmup Routes

Edit `scripts/quick-warmup.js` to add your routes:

```javascript
const quickRoutes = [
	"/",
	"/home",
	"/your-custom-route", // Add here
	"/another-route", // Add here
];
```

## 📊 Command Summary

| Command                  | Purpose           | Time | Use Case               |
| ------------------------ | ----------------- | ---- | ---------------------- |
| `npm run dev:fast`       | Dev + Auto warmup | ~10s | **Daily development**  |
| `npm run dev`            | Standard dev      | ~3s  | Manual control         |
| `npm run warmup:quick`   | Quick warmup      | ~5s  | Essential pages only   |
| `npm run warmup`         | Full warmup       | ~15s | All pages              |
| `npm run docker:dev`     | Docker dev        | ~30s | Consistent environment |
| `npm run docker:minimal` | Docker prod       | ~25s | Production testing     |

## 🎉 Best Practices

1. **Use `npm run dev:fast`** for daily development
2. **Wait for warmup to complete** before browsing
3. **Use Docker** for production-like testing
4. **Run warmup after code changes** to key pages
5. **Keep terminal open** to see compilation status

---

## 🚀 TL;DR - Just Run This:

```bash
npm run dev:fast
```

Wait for "Development environment is ready!" message, then open http://localhost:3000

Your pages will load instantly! 🎉
