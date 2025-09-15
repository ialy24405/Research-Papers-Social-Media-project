-- ScholarStream Database Schema
-- Run this script to create all necessary tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    ssn VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    image_hint VARCHAR(255)
);

-- Create papers table
CREATE TABLE IF NOT EXISTS papers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id VARCHAR(100) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    pdf_url TEXT NOT NULL,
    ai_summary TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    approved_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create paper_interactions table
CREATE TABLE IF NOT EXISTS paper_interactions (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('comment', 'save', 'share')),
    comment_text TEXT,
    parent_comment_id INTEGER REFERENCES paper_interactions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
CREATE INDEX IF NOT EXISTS idx_papers_status ON papers(status);
CREATE INDEX IF NOT EXISTS idx_papers_category ON papers(category_id);
CREATE INDEX IF NOT EXISTS idx_papers_author ON papers(author_id);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at);
CREATE INDEX IF NOT EXISTS idx_paper_interactions_paper ON paper_interactions(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_interactions_user ON paper_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_interactions_type ON paper_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_paper_interactions_parent_comment_id ON paper_interactions(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_paper_reactions_paper ON paper_reactions(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_reactions_user ON paper_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_reactions_type ON paper_reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_paper_reactions_created_at ON paper_reactions(created_at);

-- Create unique index for paper interactions (allows multiple comments)
CREATE UNIQUE INDEX IF NOT EXISTS unique_paper_user_non_comment_interaction 
ON paper_interactions(paper_id, user_id, interaction_type) 
WHERE interaction_type != 'comment';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_papers_updated_at BEFORE UPDATE ON papers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paper_reactions_updated_at BEFORE UPDATE ON paper_reactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
