# Docker Setup for Papers Project

This document explains how to run the Papers Project using Docker and Docker Compose.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Development Mode

1. **Build and run the development environment:**

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   - Open your browser and go to http://localhost:3000

### Production Mode

1. **Build and run the production environment:**

   ```bash
   docker-compose up --build
   ```

2. **Run with nginx reverse proxy:**
   ```bash
   docker-compose --profile production up --build
   ```

## Available Commands

### Development

```bash
# Start development server with hot reloading
docker-compose -f docker-compose.dev.yml up

# Build development image
docker-compose -f docker-compose.dev.yml build

# Stop development server
docker-compose -f docker-compose.dev.yml down
```

### Production

```bash
# Start production server
docker-compose up

# Start with nginx reverse proxy
docker-compose --profile production up

# Build production image
docker-compose build

# Stop production server
docker-compose down
```

### Individual Docker Commands

```bash
# Build production image
docker build -t papers-project .

# Build development image
docker build -f Dockerfile.dev -t papers-project-dev .

# Run production container
docker run -p 3000:3000 papers-project

# Run development container with volume mounting
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules papers-project-dev
```

## Configuration Files

- **Dockerfile**: Multi-stage production build
- **Dockerfile.dev**: Development build with hot reloading
- **docker-compose.yml**: Production setup with optional nginx
- **docker-compose.dev.yml**: Development setup
- **nginx.conf**: Nginx reverse proxy configuration
- **.dockerignore**: Files to exclude from Docker build context

## Environment Variables

The following environment variables are configured:

- `NODE_ENV`: Set to 'production' or 'development'
- `NEXT_TELEMETRY_DISABLED`: Disables Next.js telemetry
- `PORT`: Application port (default: 3000)
- `HOSTNAME`: Bind hostname (default: "0.0.0.0")

## Ports

- **3000**: Next.js application (development and production)
- **80**: Nginx HTTP (production with nginx profile)
- **443**: Nginx HTTPS (production with nginx profile, requires SSL setup)

## Volumes (Development)

In development mode, the following volumes are mounted:

- Source code: `.:/app`
- Node modules: `/app/node_modules`
- Next.js cache: `/app/.next`

## Health Checks

The production setup includes health checks that:

- Test the application every 30 seconds
- Timeout after 10 seconds
- Retry 3 times before marking as unhealthy
- Wait 40 seconds before starting health checks

## Nginx Configuration

When using the production profile with nginx:

- Serves as a reverse proxy
- Provides gzip compression
- Adds security headers
- Handles static file caching
- Ready for SSL/HTTPS configuration

## Troubleshooting

1. **Port already in use:**

   ```bash
   # Find and kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Permission issues:**

   ```bash
   # Fix file permissions
   sudo chown -R $USER:$GROUP .
   ```

3. **Clear Docker cache:**

   ```bash
   docker system prune -a
   ```

4. **View container logs:**
   ```bash
   docker-compose logs papers-app
   ```

## Best Practices

- Use the development setup for local development
- Use the production setup for staging and production environments
- Enable the nginx profile for production deployments
- Regularly update base images for security patches
- Use specific version tags instead of 'latest' in production
