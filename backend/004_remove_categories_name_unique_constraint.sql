-- Remove unique constraint on categories.name to allow temporary duplicates during ID changes
-- This allows the admin to change category IDs without constraint violations

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;

-- Add comment to document the change
COMMENT ON COLUMN categories.name IS 'Category name - unique constraint removed to allow ID changes';