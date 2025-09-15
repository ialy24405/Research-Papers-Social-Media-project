# Papers Project - Unified Structure Guide

## 📁 **New Project Structure**

```
papers-project/
├── src/
│   ├── app/                    # Next.js frontend pages
│   ├── components/            # React components
│   ├── lib/                   # Frontend utilities
│   ├── hooks/                 # React hooks
│   └── server/                # 🆕 Backend API
│       ├── api/               # API routes and controllers
│       ├── config/            # Database and server config
│       ├── package.json       # Backend dependencies
│       └── server.ts          # Backend entry point
├── package.json               # 🆕 Unified dependencies & scripts
├── docker-compose.unified.yml # 🆕 Unified Docker setup
└── Dockerfile.unified         # 🆕 Single container build
```

## 🚀 **Single Command Development**

### Start Everything with One Command:

```bash
npm run dev
```

This starts both:

- **Frontend**: Next.js on http://localhost:3002 (with Turbopack)
- **Backend**: Express API on http://localhost:3001

### Other Unified Commands:

```bash
# Build both frontend and backend
npm run build

# Start production mode (both services)
npm start

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend
```

## 🐳 **Docker Deployment**

### Using Unified Container:

```bash
# Build and start unified application
docker-compose -f docker-compose.unified.yml up --build

# Or using the original separate containers
docker-compose up --build
```

## 📋 **Key Changes Made**

### 1. **Project Structure**

- ✅ Moved `backend/src/*` → `src/server/`
- ✅ Backend now lives alongside frontend in `src/`
- ✅ Unified dependency management

### 2. **Package.json Updates**

- ✅ Added `concurrently` to run both services
- ✅ New scripts: `dev`, `build`, `start` run both services
- ✅ `postinstall` hook installs backend dependencies

### 3. **Fixed All Port 3005 References**

- ✅ Updated `src/lib/config.ts` fallbacks
- ✅ Fixed docker-compose port mapping
- ✅ All API calls now use nginx proxy on port 3000

### 4. **Docker Options**

- ✅ **Original**: Separate containers (frontend, backend, nginx, database)
- ✅ **New Unified**: Single app container (frontend + backend, database)

## 🔧 **Development Workflow**

### Quick Start:

1. **Clone & Install**:

   ```bash
   git clone <repo>
   cd papers-project
   npm install  # Installs both frontend & backend deps
   ```

2. **Start Development**:

   ```bash
   npm run dev  # Starts both frontend & backend
   ```

3. **Access Application**:
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001/api
   - Database: localhost:5432

### Production Deployment:

```bash
# Option 1: Unified Docker Container
docker-compose -f docker-compose.unified.yml up -d

# Option 2: Original Multi-Container Setup
docker-compose up -d

# Both serve the app on: http://localhost:3000
```

## ✅ **Benefits**

1. **Single Command**: `npm run dev` starts everything
2. **Simplified Structure**: Both frontend/backend in `src/`
3. **No Port Conflicts**: Fixed all hardcoded port issues
4. **Flexible Deployment**: Choose unified or multi-container
5. **Better DX**: Unified dependencies and scripts

## 🌟 **Recommendation**

Use **`npm run dev`** for development and **`docker-compose.unified.yml`** for production deployment. This gives you the best of both worlds - simple development workflow and production-ready containerization.

---

**🎉 You can now start both frontend and backend with a single `npm run dev` command!**
