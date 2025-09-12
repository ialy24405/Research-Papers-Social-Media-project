# ScholarStream Backend

A complete REST API backend for the ScholarStream academic paper-sharing platform built with Node.js, Express.js, and PostgreSQL.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Paper Management**: Upload, review, approve/reject academic papers
- **Category System**: Organized academic categories with CRUD operations
- **Admin Panel**: Admin-only features for content moderation
- **File Upload**: PDF file handling with validation and storage
- **Security**: Rate limiting, CORS, helmet security headers
- **Database**: PostgreSQL with proper indexing and constraints

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration:

   ```env
   NODE_ENV=development
   PORT=3001

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=scholarstream
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d

   # File Upload
   UPLOAD_DIR=uploads/
   MAX_FILE_SIZE=10485760

   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Database Setup**

   Create PostgreSQL database:

   ```sql
   CREATE DATABASE scholarstream;
   ```

   Run migrations:

   ```bash
   npm run build
   npm run db:migrate
   ```

   Seed initial data:

   ```bash
   npm run db:seed
   ```

## 🏃‍♂️ Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "birthDate": "1995-05-15",
  "collegeName": "MIT",
  "country": "USA",
  "ssn": "123-45-6789"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Paper Endpoints

#### Get All Papers

```http
GET /api/papers?status=approved&categoryId=cs&limit=10
```

#### Upload Paper

```http
POST /api/papers/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Machine Learning in Healthcare",
  "description": "A comprehensive study on ML applications",
  "categoryId": "cs",
  "pdfFile": <file>
}
```

#### Get Single Paper

```http
GET /api/papers/123
```

### Category Endpoints

#### Get All Categories

```http
GET /api/categories
```

#### Get Single Category

```http
GET /api/categories/cs
```

### User Endpoints

#### Get User's Papers

```http
GET /api/users/me/papers
Authorization: Bearer <token>
```

#### Get Saved Papers

```http
GET /api/users/me/saved-papers
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get Papers for Review

```http
GET /api/admin/papers?status=pending
Authorization: Bearer <admin-token>
```

#### Approve/Reject Paper

```http
PUT /api/admin/papers/123/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "approved"
}
```

#### Create Category

```http
POST /api/admin/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "bio",
  "name": "Biology",
  "description": "Life sciences and biological research"
}
```

#### Delete Category

```http
DELETE /api/admin/categories/bio
Authorization: Bearer <admin-token>
```

## 🗃️ Database Schema

### Users Table

- `id` (SERIAL PRIMARY KEY)
- `full_name` (VARCHAR(255))
- `email` (VARCHAR(255) UNIQUE)
- `password_hash` (VARCHAR(255))
- `birth_date` (DATE)
- `college_name` (VARCHAR(255))
- `country` (VARCHAR(255))
- `ssn` (VARCHAR(255))
- `avatar_url` (TEXT)
- `role` (VARCHAR(50) DEFAULT 'user')
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

### Categories Table

- `id` (VARCHAR(100) PRIMARY KEY)
- `name` (VARCHAR(255) UNIQUE)
- `description` (TEXT)
- `image_url` (TEXT)
- `image_hint` (VARCHAR(255))

### Papers Table

- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(255))
- `description` (TEXT)
- `author_id` (INTEGER REFERENCES users(id))
- `category_id` (VARCHAR(100) REFERENCES categories(id))
- `pdf_url` (TEXT)
- `ai_summary` (TEXT)
- `status` (VARCHAR(50) DEFAULT 'pending')
- `rejection_reason` (TEXT)
- `approved_by_id` (INTEGER REFERENCES users(id))
- `created_at` (TIMESTAMPTZ DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ DEFAULT NOW())

### Paper Interactions Table

- `id` (SERIAL PRIMARY KEY)
- `paper_id` (INTEGER REFERENCES papers(id))
- `user_id` (INTEGER REFERENCES users(id))
- `interaction_type` (VARCHAR(50))
- `comment_text` (TEXT)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for protection
- **Input Validation**: Joi schema validation for all inputs
- **File Upload Security**: PDF-only uploads with size limits

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Authentication & validation
│   │   ├── models/         # Database query logic
│   │   ├── routes/         # Express routes
│   │   └── utils/          # Validation schemas
│   ├── config/             # Database & app configuration
│   └── app.ts              # Main Express application
├── uploads/                # File storage directory
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing

Run the application and test the endpoints using:

- Postman
- curl commands
- Your frontend application

## 🔧 Configuration

### Environment Variables

- `NODE_ENV`: Application environment (development/production)
- `PORT`: Server port (default: 3001)
- `DB_*`: PostgreSQL connection details
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: Token expiration time
- `UPLOAD_DIR`: File upload directory
- `MAX_FILE_SIZE`: Maximum upload file size
- `CORS_ORIGIN`: Allowed frontend origin

### File Upload

- Maximum file size: 10MB (configurable)
- Allowed file types: PDF only
- Storage: Local filesystem (uploads/ directory)
- Filename format: `paper-{timestamp}-{random}.pdf`

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
	"error": "Error message description"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the error logs for debugging

---

**ScholarStream Backend** - Empowering academic knowledge sharing through technology.
