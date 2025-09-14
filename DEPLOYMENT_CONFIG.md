# Deployment Configuration Guide

This guide explains how to configure the backend URLs for different deployment environments.

## Environment Variables

The application uses the following environment variables to configure backend URLs:

### `NEXT_PUBLIC_API_URL`

- **Purpose**: Base URL for API endpoints
- **Format**: `https://your-domain.com/api`
- **Used for**: API calls to endpoints like `/api/papers`, `/api/auth`, etc.

### `NEXT_PUBLIC_SERVER_URL`

- **Purpose**: Base URL for static file serving (PDFs, images, etc.)
- **Format**: `https://your-domain.com`
- **Used for**: Accessing uploaded files like PDFs in the `/uploads` directory

## Configuration Files

### Development

Use `.env.development.example` as a template:

```bash
cp .env.development.example .env.local
```

### Staging

Use `.env.staging.example` as a template:

```bash
cp .env.staging.example .env.local
# Edit .env.local with your staging URLs
```

### Production

Use `.env.production.example` as a template:

```bash
cp .env.production.example .env.local
# Edit .env.local with your production URLs
```

## Common Deployment Scenarios

### 1. Same Domain Deployment

If your frontend and backend are on the same domain:

```bash
NEXT_PUBLIC_API_URL=https://myapp.com/api
NEXT_PUBLIC_SERVER_URL=https://myapp.com
```

### 2. Subdomain Deployment

If your backend is on a subdomain:

```bash
NEXT_PUBLIC_API_URL=https://api.myapp.com/api
NEXT_PUBLIC_SERVER_URL=https://api.myapp.com
```

### 3. Different Domain Deployment

If your backend is on a completely different domain:

```bash
NEXT_PUBLIC_API_URL=https://backend.example.com/api
NEXT_PUBLIC_SERVER_URL=https://backend.example.com
```

### 4. Docker Deployment

For Docker deployments, you can use environment variables:

```dockerfile
ENV NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
ENV NEXT_PUBLIC_SERVER_URL=https://your-backend-url.com
```

### 5. Vercel/Netlify Deployment

Set environment variables in your deployment platform:

- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

## Testing Configuration

To test if your configuration is working:

1. **Check API calls**: Open browser dev tools and verify API requests go to the correct URL
2. **Check PDF loading**: Navigate to a paper page and verify PDFs load from the correct backend URL
3. **Check download links**: Test PDF download functionality

## Troubleshooting

### PDFs not loading

- Verify `NEXT_PUBLIC_SERVER_URL` points to your backend server
- Check that your backend serves static files from `/uploads`
- Ensure CORS is configured correctly on your backend

### API calls failing

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check that your backend API is accessible from the frontend domain
- Verify CORS configuration allows requests from your frontend domain

## Security Notes

- Always use HTTPS in production
- Configure CORS properly on your backend
- Consider using environment-specific domains (staging, production)
- Never commit `.env.local` files to version control
