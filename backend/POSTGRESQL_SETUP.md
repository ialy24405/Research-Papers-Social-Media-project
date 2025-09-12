# PostgreSQL Setup Guide for ScholarStream

## Option 1: Install PostgreSQL on Windows

### Download and Install

1. Go to https://www.postgresql.org/download/windows/
2. Download the PostgreSQL installer for Windows
3. Run the installer and follow these settings:
   - **Port**: 5432 (default)
   - **Superuser password**: Choose a strong password (remember it!)
   - **Locale**: Default locale

### After Installation

1. PostgreSQL should start automatically as a Windows service
2. You can access it via:
   - **pgAdmin 4** (GUI tool) - installed with PostgreSQL
   - **Command line** - `psql` command

## Option 2: Using Docker (Recommended for Development)

### Install Docker Desktop

1. Download from https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop

### Run PostgreSQL Container

```bash
# Run PostgreSQL in Docker
docker run --name scholarstream-postgres -e POSTGRES_PASSWORD=scholarstream123 -e POSTGRES_DB=scholarstream -p 5432:5432 -d postgres:15

# Check if it's running
docker ps
```

## Verify PostgreSQL is Running

### Using Command Line (Option 1)

```bash
# Test connection (replace password with yours)
psql -h localhost -p 5432 -U postgres -d postgres
```

### Using pgAdmin (Option 1)

1. Open pgAdmin 4
2. Right-click "Servers" → "Create" → "Server"
3. **General Tab**: Name: "ScholarStream"
4. **Connection Tab**:
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: [your password]

### Using Docker (Option 2)

```bash
# Connect to Docker PostgreSQL
docker exec -it scholarstream-postgres psql -U postgres -d scholarstream
```

## Create Database and User

### SQL Commands to Run

```sql
-- Create database (if not using Docker setup)
CREATE DATABASE scholarstream;

-- Create a dedicated user (optional but recommended)
CREATE USER scholarstream_user WITH PASSWORD 'scholarstream_pass';
GRANT ALL PRIVILEGES ON DATABASE scholarstream TO scholarstream_user;

-- Connect to the database
\c scholarstream;

-- Verify connection
SELECT version();
```

## Configuration Files

### 1. Create .env file

```bash
# Copy the example file
cp .env.example .env
```

### 2. Edit .env with your settings

**For Docker setup:**

```env
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scholarstream
DB_USER=postgres
DB_PASSWORD=scholarstream123

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production_make_it_very_long_and_random
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10485760

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**For Local PostgreSQL:**

```env
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scholarstream
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production_make_it_very_long_and_random
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10485760

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Test Database Connection

### Using Node.js Script

Create a test file to verify connection:

```javascript
// test-db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
});

async function testConnection() {
	try {
		const client = await pool.connect();
		const result = await client.query("SELECT NOW()");
		console.log("✅ Database connected successfully!");
		console.log("Current time:", result.rows[0].now);
		client.release();
		await pool.end();
	} catch (error) {
		console.error("❌ Database connection failed:", error.message);
	}
}

testConnection();
```

## Troubleshooting

### Common Issues

1. **Connection refused (ECONNREFUSED)**

   - PostgreSQL service is not running
   - Wrong host/port in configuration
   - Firewall blocking connection

2. **Authentication failed**

   - Wrong username/password
   - User doesn't have permissions

3. **Database doesn't exist**
   - Create the database first: `CREATE DATABASE scholarstream;`

### Solutions

**Windows Service Issues:**

```bash
# Start PostgreSQL service
net start postgresql-x64-15

# Stop PostgreSQL service
net stop postgresql-x64-15
```

**Docker Issues:**

```bash
# Check if container is running
docker ps

# Start stopped container
docker start scholarstream-postgres

# View container logs
docker logs scholarstream-postgres

# Remove and recreate container
docker rm scholarstream-postgres
docker run --name scholarstream-postgres -e POSTGRES_PASSWORD=scholarstream123 -e POSTGRES_DB=scholarstream -p 5432:5432 -d postgres:15
```

## Next Steps

After PostgreSQL is running and configured:

1. **Test connection**: Run the test script above
2. **Install dependencies**: `npm install`
3. **Build project**: `npm run build`
4. **Run migrations**: `npm run db:migrate`
5. **Seed data**: `npm run db:seed`
6. **Start server**: `npm run dev`

## Useful Commands

```bash
# Check if PostgreSQL is listening on port 5432
netstat -an | findstr 5432

# Connect to database via command line
psql -h localhost -p 5432 -U postgres -d scholarstream

# List all databases
\l

# List all tables in current database
\dt

# Describe table structure
\d table_name

# Exit psql
\q
```
