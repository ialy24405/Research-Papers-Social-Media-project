## ScholarStream Backend API

### Overview

Complete REST API backend for academic paper sharing platform with user authentication, paper management, and admin features.

### Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run build
npm run db:migrate
npm run db:seed
npm run dev
```

### API Endpoints Summary

**Authentication**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

**Papers**

- `GET /api/papers` - List papers (with filters)
- `POST /api/papers/upload` - Upload paper (auth required)
- `GET /api/papers/:id` - Get single paper

**Categories**

- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get single category

**User**

- `GET /api/users/me/papers` - Get user's papers (auth required)
- `GET /api/users/me/saved-papers` - Get saved papers (auth required)

**Admin** (admin role required)

- `GET /api/admin/papers` - Papers for review
- `PUT /api/admin/papers/:id/status` - Approve/reject paper
- `POST /api/admin/categories` - Create category
- `DELETE /api/admin/categories/:id` - Delete category

### Database Schema

- **users**: User accounts with authentication
- **categories**: Academic categories (cs, bio, etc.)
- **papers**: Research papers with status tracking
- **paper_interactions**: Comments, reactions, saves

### Security Features

- JWT authentication
- bcrypt password hashing
- Rate limiting
- File upload validation
- CORS configuration
- Helmet security headers

### File Upload

- PDF files only
- 10MB size limit
- Secure filename generation
- Local storage in uploads/ directory

Ready for integration with your Next.js frontend!
