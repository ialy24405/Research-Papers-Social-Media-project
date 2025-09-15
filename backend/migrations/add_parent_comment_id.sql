-- Add parent_comment_id column to paper_interactions table for nested comments/replies
ALTER TABLE paper_interactions 
ADD COLUMN IF NOT EXISTS parent_comment_id INTEGER REFERENCES paper_interactions(id) ON DELETE CASCADE;

-- Create index for better performance when querying replies
CREATE INDEX IF NOT EXISTS idx_paper_interactions_parent_comment_id ON paper_interactions(parent_comment_id);
