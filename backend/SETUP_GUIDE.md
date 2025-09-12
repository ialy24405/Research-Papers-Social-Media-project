# ScholarStream Backend Setup Guide

## Quick Setup Instructions

### Step 1: PostgreSQL Setup

**Option A: Using Docker (Recommended)**

```bash
# Start PostgreSQL with Docker
docker run --name scholarstream-postgres -e POSTGRES_PASSWORD=scholarstream123 -e POSTGRES_DB=scholarstream -p 5432:5432 -d postgres:15

# Verify it's running
docker ps
```

**Option B: Local Installation**

1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create database: `CREATE DATABASE scholarstream;`

### Step 2: Backend Configuration

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

4. **Edit .env file with your settings:**

   For Docker setup:

   ```env
   NODE_ENV=development
   PORT=3001

   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=scholarstream
   DB_USER=postgres
   DB_PASSWORD=scholarstream123

   JWT_SECRET=your_super_secret_jwt_key_change_this_to_something_very_long_and_random
   JWT_EXPIRES_IN=7d

   UPLOAD_DIR=uploads/
   MAX_FILE_SIZE=10485760

   CORS_ORIGIN=http://localhost:3000
   ```

### Step 3: Database Setup

1. **Test database connection:**

   ```bash
   npm run test:db
   ```

2. **Build the project:**

   ```bash
   npm run build
   ```

3. **Run database migrations:**

   ```bash
   npm run db:migrate
   ```

4. **Seed initial data:**
   ```bash
   npm run db:seed
   ```

### Step 4: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at: http://localhost:3001/api

### Step 5: Test the API

**Health Check:**

```bash
curl http://localhost:3001/health
```

**Get Categories:**

```bash
curl http://localhost:3001/api/categories
```

**Register a User:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "birthDate": "1995-05-15",
    "collegeName": "MIT",
    "country": "USA",
    "ssn": "123-45-6789"
  }'
```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run test:db` - Test database connection
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed initial data
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## API Endpoints Summary

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Papers

- `GET /api/papers` - List papers (with filters)
- `POST /api/papers/upload` - Upload paper (auth required)
- `GET /api/papers/:id` - Get paper details

### Categories

- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Get category details

### User

- `GET /api/users/me/papers` - Get user's papers (auth required)
- `GET /api/users/me/saved-papers` - Get saved papers (auth required)

### Admin (admin role required)

- `GET /api/admin/papers` - Papers for review
- `PUT /api/admin/papers/:id/status` - Approve/reject paper
- `POST /api/admin/categories` - Create category
- `DELETE /api/admin/categories/:id` - Delete category

## Troubleshooting

### Database Connection Issues

1. Make sure PostgreSQL is running
2. Check .env configuration
3. Run `npm run test:db` to verify connection

### Port Already in Use

```bash
# Find what's using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Docker Issues

```bash
# Check container status
docker ps -a

# View container logs
docker logs scholarstream-postgres

# Restart container
docker restart scholarstream-postgres
```

## Ready for Frontend Integration

Once the backend is running successfully:

1. Your Next.js frontend can connect to http://localhost:3001/api
2. Use the JWT tokens for authenticated requests
3. Upload PDF files to the papers/upload endpoint
4. Admin users can manage categories and approve papers

The backend is now ready to support your ScholarStream frontend!
