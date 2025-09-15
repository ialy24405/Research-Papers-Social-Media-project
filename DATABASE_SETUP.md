# ScholarStream Database Setup

This directory contains the complete database setup for the ScholarStream Papers Social Media Platform.

## 📁 Files

### `database_setup.sql` - **Main Database Setup File**

This is the **consolidated, complete database setup file** that contains:

- All table schemas
- All migrations combined
- Performance indexes
- Functions and triggers
- Verification tools
- Setup completion messages

**Use this file for:**

- ✅ **New deployments**
- ✅ **Fresh database setup**
- ✅ **Production deployment**
- ✅ **Development environment setup**

## 🚀 How to Use

### Method 1: Docker Compose (Automatic Setup)

The `docker-compose.yml` file is already configured to automatically run the database setup:

```bash
# Start the entire application (database will auto-setup)
docker compose up -d

# The database_setup.sql file will automatically run when the database container starts for the first time
```

### Method 2: Manual Database Setup

If you need to manually run the database setup:

```bash
# Copy the setup file to the database container
docker cp database_setup.sql database:/tmp/database_setup.sql

# Run the setup
docker exec database psql -U papers_user -d papers_social_media -f /tmp/database_setup.sql
```

### Method 3: Reset Database (Fresh Setup)

To completely reset and recreate the database:

```bash
# Reset the database schema
docker exec database psql -U papers_user -d papers_social_media -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO papers_user; GRANT ALL ON SCHEMA public TO public;"

# Run the consolidated setup
docker cp database_setup.sql database:/tmp/database_setup.sql
docker exec database psql -U papers_user -d papers_social_media -f /tmp/database_setup.sql
```

## 🗄️ Database Schema Overview

### Tables Created:

1. **`users`** - User accounts with roles (user, admin, owner)
2. **`categories`** - Research paper categories
3. **`papers`** - Research papers with approval workflow
4. **`paper_interactions`** - Comments, saves, shares (with nested comments support)
5. **`paper_reactions`** - Like reactions (like, love, support, insightful)

### Features:

- ✅ **User Authentication & Authorization**
- ✅ **Paper Submission & Approval Workflow**
- ✅ **Categorization System**
- ✅ **Nested Comments & Replies**
- ✅ **Multiple Reaction Types**
- ✅ **Paper Saving & Sharing**
- ✅ **Performance Indexes**
- ✅ **Automatic Timestamp Updates**

## 🔍 Verification

After setup, you can verify the database is working:

```bash
# Check database tables
docker exec database psql -U papers_user -d papers_social_media -c "\dt"

# Run verification function
docker exec database psql -U papers_user -d papers_social_media -c "SELECT * FROM verify_database_setup();"

# Test API endpoints
curl http://localhost:3000/api/papers
curl http://localhost:3000/api/categories
curl http://localhost:3000/health
```

## 📊 Database Credentials

As configured in `docker-compose.yml`:

- **Database**: `papers_social_media`
- **Username**: `papers_user`
- **Password**: `papers_password`
- **Host**: `localhost` (or `database` within Docker network)
- **Port**: `5432`

## ⚡ Performance Features

The database setup includes optimized indexes for:

- Paper status and category filtering
- User lookups and authentication
- Comment threading and nested replies
- Reaction aggregation and counting
- Timestamp-based sorting and pagination

## 🛠️ Maintenance

The setup includes:

- **Automatic triggers** for updating timestamps
- **Verification functions** for health checks
- **Proper foreign key constraints** for data integrity
- **Performance indexes** for optimal query speed
- **Role-based access control** for security

---

**✅ This consolidated setup replaces all individual migration files and provides a single, reliable database initialization.**
