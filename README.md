# 📚 Research Papers Social Media Platform

A full-stack social media platform designed specifically for academic researchers to share, discover, and interact with research papers. Built with **Next.js 15**, **Express.js**, and **PostgreSQL**.

## 🚀 Quick Start

### 🔥 Development Setup

```bash
# Clone and install dependencies
git clone <your-repo>
cd papers-project
npm install

# Start development servers
npm run dev:backend  # Backend on http://localhost:3005
npm run dev:frontend # Frontend on http://localhost:3000
```

### 🚀 Production Deployment (Single Port with Docker)

```bash
# Start all services with single port access
docker-compose up --build

# Services will be accessible at:
# Frontend & API: http://localhost:3000
```

## 🌟 Features

### 🎯 Core Features

- **Paper Management**: Upload, share, and organize research papers
- **User Authentication**: Secure registration and login system
- **Social Interactions**: React, comment, save, and share papers
- **Category System**: Organize papers by academic disciplines
- **Admin Dashboard**: Comprehensive analytics and management tools
- **User Profiles**: Personalized profiles with interaction history

### 🔧 Advanced Features

- **Role-based Access Control**: Owner, Admin, and User roles
- **Real-time Interactions**: Live paper reactions and comments
- **Advanced Search**: Filter papers by status, category, and author
- **File Management**: Secure PDF upload and storage
- **Analytics Dashboard**: User engagement and platform statistics
- **Responsive Design**: Mobile-first UI with modern components
- **Single-Port Deployment**: Frontend and backend accessible through one port

## 🏗️ Architecture

### Frontend (Next.js 15)

```
src/
├── app/                    # App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (main)/            # Main application pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── home/          # Home feed
│   │   ├── papers/        # Paper details
│   │   ├── profile/       # User profiles
│   │   └── upload/        # Paper upload
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # Shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API clients
│   ├── api/              # API service layer
│   └── types.ts          # TypeScript type definitions
└── contexts/             # React contexts (Auth, etc.)
```

### Backend (Express.js)

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Authentication & validation
│   │   ├── models/        # Database models
│   │   └── routes/        # API routes
│   ├── config/           # Database & app configuration
│   └── server.ts         # Main server file
├── migrations/           # Database migration scripts
└── uploads/              # File storage directory
```

### Database (PostgreSQL)

- **Users**: Authentication and profile management
- **Papers**: Research paper storage and metadata
- **Categories**: Academic discipline classification
- **Interactions**: Comments, saves, and reactions
- **Reactions**: Like/love/wow/angry/sad reactions

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Hook Form** for form management
- **Zustand** for state management

### Backend

- **Express.js** with TypeScript
- **PostgreSQL** with pg driver
- **JWT** for authentication
- **Multer** for file uploads
- **Helmet** for security
- **CORS** for cross-origin requests

### DevOps & Tools

- **Docker** for containerization
- **ESLint** & **Prettier** for code quality
- **Husky** for git hooks

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 1. Clone Repository

```bash
git clone https://github.com/ialy24405/Research-Papers-Social-Media-project.git
cd Research-Papers-Social-Media-project
```

### 2. Environment Setup

#### Frontend Configuration

Create `.env.local` in the root directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3005/api
# Backend Server URL (for static files like PDFs)
NEXT_PUBLIC_SERVER_URL=http://localhost:3005
```

#### Backend Configuration

Create `.env` in the `backend/` directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=3005

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=papers_social_media
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### 3. Database Setup

1. **Create PostgreSQL Database**:

```sql
CREATE DATABASE papers_social_media;
```

2. **Run Migrations**:

```bash
cd backend
npm install
npm run migrate
```

### 4. Install Dependencies

#### Frontend

```bash
npm install
```

#### Backend

```bash
cd backend
npm install
```

### 5. Start Development Servers

#### Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Server runs on: http://localhost:3005

#### Frontend (Terminal 2)

```bash
npm run dev
```

Application runs on: http://localhost:3000

## � Docker Setup (Recommended)

### Prerequisites for Docker

- Docker Desktop or Docker Engine
- Docker Compose

### Quick Start with Docker

1. **Clone Repository**:

```bash
git clone https://github.com/ialy24405/Research-Papers-Social-Media-project.git
cd Research-Papers-Social-Media-project
```

2. **Start All Services**:

```bash
# Start frontend, backend, and database
docker-compose up --build
```

This command will:

- Build and start PostgreSQL database on port 5432
- Build and start Express.js backend (internal)
- Build and start Next.js frontend (internal)
- Set up Nginx reverse proxy on port 3000
- Create persistent volumes for database and file uploads

3. **Access the Application**:

- **Frontend & API**: http://localhost:3000
- **Backend API**: http://localhost:3000/api
- **Database**: localhost:5432 (internal use)

### Docker Commands

```bash
# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build backend

# Development with only database
docker-compose -f docker-compose.dev.yml up -d database
```

### Environment Variables for Docker

The docker-compose.yml includes default environment variables. For production, update:

- **JWT_SECRET**: Change the default JWT secret
- **POSTGRES_PASSWORD**: Use a secure database password
- **Database credentials**: Update if needed

### Docker Development Workflow

For development, you can run only the database in Docker and run frontend/backend locally:

```bash
# Start only PostgreSQL
docker-compose -f docker-compose.dev.yml up -d database

# Then run frontend and backend locally as described in the manual setup
```

## �📱 Usage

### For Users

1. **Register/Login**: Create an account or sign in
2. **Browse Papers**: Explore papers on the home feed
3. **Upload Papers**: Share your research with the community
4. **Interact**: React, comment, and save interesting papers
5. **Profile**: Manage your profile and view your activity

### For Administrators

1. **Admin Dashboard**: Access comprehensive platform analytics
2. **User Management**: Manage user roles and accounts
3. **Content Moderation**: Approve, reject, or moderate papers
4. **Category Management**: Create and organize academic categories
5. **Insights**: View platform statistics and user engagement

## 🔐 API Endpoints

### Authentication

```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout
GET  /api/auth/refresh     # Refresh token
```

### Papers

```
GET    /api/papers         # Get papers with filters
POST   /api/papers         # Upload new paper
GET    /api/papers/:id     # Get paper details
PUT    /api/papers/:id     # Update paper
DELETE /api/papers/:id     # Delete paper
```

### Admin Routes (Requires Admin Role)

```
GET    /api/admin/papers    # Get all papers for review
PUT    /api/admin/papers/:id/status  # Update paper status
GET    /api/admin/users     # Get all users
PUT    /api/admin/users/:id/role     # Update user role
GET    /api/admin/insights  # Get platform analytics
```

## 🔧 Development

### Code Style

- **ESLint** configuration for consistent code style
- **Prettier** for automatic code formatting
- **TypeScript** strict mode enabled

### File Structure Guidelines

- Use **kebab-case** for files and folders
- **PascalCase** for React components
- **camelCase** for functions and variables
- Group related components in feature folders

### Database Migrations

```bash
cd backend
npm run migrate        # Run all pending migrations
npm run migrate:create # Create new migration
```

## 🚀 Deployment

### Production Build

```bash
# Frontend
npm run build
npm start

# Backend
cd backend
npm run build
npm start
```

### Environment Variables (Production)

Update `.env` files with production values:

- Database connection strings
- JWT secrets
- File storage paths
- CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Aly Ibrahim** - Full Stack Developer & Project Lead

## 🆘 Support

For support or questions:

- Create an issue on GitHub
- Contact: [Your Email]

---

**Built with ❤️ for the academic community**
