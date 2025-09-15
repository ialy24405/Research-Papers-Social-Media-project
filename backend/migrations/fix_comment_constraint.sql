-- Fix paper_interactions constraint to allow multiple comments per user per paper
-- while maintaining uniqueness for other interaction types (reaction, save, share)

-- Drop the existing constraint
ALTER TABLE paper_interactions DROP CONSTRAINT IF EXISTS unique_paper_user_interaction;

-- Create a partial unique constraint that excludes comments
-- This allows multiple comments but keeps uniqueness for reactions, saves, shares
CREATE UNIQUE INDEX IF NOT EXISTS unique_paper_user_non_comment_interaction 
ON paper_interactions(paper_id, user_id, interaction_type) 
WHERE interaction_type != 'comment';

-- Comments can have multiple entries per user per paper, so no constraint needed for them