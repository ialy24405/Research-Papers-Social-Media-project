# Supabase Configuration for File Storage
# Add these to your Vercel environment variables and local .env.local

# Your Supabase project URL (found in Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anon/public key (found in Project Settings > API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Your Supabase service role key (found in Project Settings > API)
# This is used for server-side operations like file uploads
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Your existing environment variables
JWT_SECRET=your-jwt-secret
POSTGRES_URL=your-supabase-postgres-connection-string