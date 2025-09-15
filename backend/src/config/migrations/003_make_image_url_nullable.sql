-- Migration: Make image_url nullable in categories table and allow editing
-- This migration updates the categories table to make image_url optional

-- Make image_url nullable
ALTER TABLE categories ALTER COLUMN image_url DROP NOT NULL;

-- The image_url column is already TEXT which allows NULL values
-- This migration just removes any NOT NULL constraint if it exists