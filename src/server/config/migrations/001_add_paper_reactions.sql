-- Migration: Add paper_reactions table
-- This creates a dedicated table for paper reactions with different reaction types

-- Create paper_reactions table
CREATE TABLE IF NOT EXISTS paper_reactions (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'support', 'insightful')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_paper_user_reaction UNIQUE(paper_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_paper_reactions_paper ON paper_reactions(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_reactions_user ON paper_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_reactions_type ON paper_reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_paper_reactions_created_at ON paper_reactions(created_at);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_paper_reactions_updated_at BEFORE UPDATE ON paper_reactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: This table replaces the generic 'reaction' entries in paper_interactions
-- You may want to migrate existing reaction data from paper_interactions to this table
-- and then remove reaction entries from paper_interactions

-- Optional: Migrate existing reaction data (uncomment if needed)
-- INSERT INTO paper_reactions (paper_id, user_id, reaction_type, created_at)
-- SELECT paper_id, user_id, 'like' as reaction_type, created_at
-- FROM paper_interactions
-- WHERE interaction_type = 'reaction';

-- Optional: Remove old reaction entries (uncomment if needed)
-- DELETE FROM paper_interactions WHERE interaction_type = 'reaction';
