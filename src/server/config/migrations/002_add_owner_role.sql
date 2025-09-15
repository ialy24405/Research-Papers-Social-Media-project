-- Migration: Add owner role to users table
-- This migration updates the role check constraint to include 'owner' role

-- Drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT users_role_check;

-- Add new check constraint that includes 'owner'
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'owner'));

-- Optional: Update existing admin users to owner if needed
-- UPDATE users SET role = 'owner' WHERE role = 'admin' AND id = 1; -- Replace 1 with your admin user ID