-- ====================================================================
-- ScholarStream Papers Project - Complete Database Setup
-- ====================================================================
-- This file contains the complete database schema and all migrations
-- Run this file to set up the entire database from scratch
-- 
-- Created: September 2025
-- Description: Consolidated database setup for Papers Social Media Platform
-- ====================================================================

-- ====================================================================
-- MAIN DATABASE SCHEMA
-- ====================================================================

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

-- Add comment to document that name unique constraint was removed
COMMENT ON COLUMN categories.name IS 'Category name - unique constraint removed to allow ID changes';

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

-- Create paper_interactions table (for comments, saves, shares)
CREATE TABLE IF NOT EXISTS paper_interactions (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('comment', 'save', 'share')),
    comment_text TEXT,
    parent_comment_id INTEGER REFERENCES paper_interactions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_paper_user_interaction UNIQUE(paper_id, user_id, interaction_type)
);

-- Create paper_reactions table (dedicated table for paper reactions)
CREATE TABLE IF NOT EXISTS paper_reactions (
    id SERIAL PRIMARY KEY,
    paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'support', 'insightful')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_paper_user_reaction UNIQUE(paper_id, user_id)
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================

-- Indexes for papers table
CREATE INDEX IF NOT EXISTS idx_papers_status ON papers(status);
CREATE INDEX IF NOT EXISTS idx_papers_category ON papers(category_id);
CREATE INDEX IF NOT EXISTS idx_papers_author ON papers(author_id);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at);

-- Indexes for paper_interactions table
CREATE INDEX IF NOT EXISTS idx_paper_interactions_paper ON paper_interactions(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_interactions_user ON paper_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_interactions_type ON paper_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_paper_interactions_parent_comment_id ON paper_interactions(parent_comment_id);

-- Indexes for paper_reactions table
CREATE INDEX IF NOT EXISTS idx_paper_reactions_paper ON paper_reactions(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_reactions_user ON paper_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_reactions_type ON paper_reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_paper_reactions_created_at ON paper_reactions(created_at);

-- ====================================================================
-- FUNCTIONS AND TRIGGERS
-- ====================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_papers_updated_at 
    BEFORE UPDATE ON papers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paper_reactions_updated_at 
    BEFORE UPDATE ON paper_reactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- SAMPLE DATA (OPTIONAL)
-- ====================================================================

-- Insert sample categories (uncomment if you want sample data)
/*
INSERT INTO categories (id, name, description, image_hint) VALUES 
('computer-science', 'Computer Science', 'Research papers in computer science, AI, machine learning, and software engineering', 'Technology and algorithms'),
('medicine', 'Medicine', 'Medical research, clinical studies, and healthcare innovations', 'Healthcare and medical research'),
('physics', 'Physics', 'Physics research including quantum mechanics, relativity, and experimental physics', 'Scientific formulas and experiments'),
('chemistry', 'Chemistry', 'Chemical research, molecular studies, and material science', 'Laboratory and molecular structures'),
('biology', 'Biology', 'Biological research, genetics, ecology, and life sciences', 'Nature and biological systems'),
('mathematics', 'Mathematics', 'Mathematical research, proofs, and theoretical mathematics', 'Mathematical equations and symbols'),
('engineering', 'Engineering', 'Engineering research across all disciplines including civil, mechanical, electrical', 'Engineering tools and structures'),
('psychology', 'Psychology', 'Psychological studies, behavioral research, and cognitive science', 'Human behavior and mind'),
('economics', 'Economics', 'Economic research, market analysis, and financial studies', 'Charts and economic indicators'),
('social-sciences', 'Social Sciences', 'Sociology, anthropology, political science, and related fields', 'Society and human interactions')
ON CONFLICT (id) DO NOTHING;
*/

-- ====================================================================
-- DATABASE SETUP VERIFICATION
-- ====================================================================

-- Function to verify database setup
CREATE OR REPLACE FUNCTION verify_database_setup()
RETURNS TABLE(table_name TEXT, record_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 'users'::TEXT, COUNT(*) FROM users
    UNION ALL
    SELECT 'categories'::TEXT, COUNT(*) FROM categories
    UNION ALL
    SELECT 'papers'::TEXT, COUNT(*) FROM papers
    UNION ALL
    SELECT 'paper_interactions'::TEXT, COUNT(*) FROM paper_interactions
    UNION ALL
    SELECT 'paper_reactions'::TEXT, COUNT(*) FROM paper_reactions;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- SETUP COMPLETION MESSAGE
-- ====================================================================

DO $$
BEGIN
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'ScholarStream Database Setup Complete!';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '  - users (with roles: user, admin, owner)';
    RAISE NOTICE '  - categories (research paper categories)';
    RAISE NOTICE '  - papers (research papers with approval workflow)';
    RAISE NOTICE '  - paper_interactions (comments, saves, shares with nested comments)';
    RAISE NOTICE '  - paper_reactions (likes, loves, support, insightful)';
    RAISE NOTICE '';
    RAISE NOTICE 'Features included:';
    RAISE NOTICE '  ✓ User authentication and authorization';
    RAISE NOTICE '  ✓ Paper submission and approval workflow';
    RAISE NOTICE '  ✓ Categorization system';
    RAISE NOTICE '  ✓ Nested comments and replies';
    RAISE NOTICE '  ✓ Multiple reaction types';
    RAISE NOTICE '  ✓ Paper saving and sharing';
    RAISE NOTICE '  ✓ Performance indexes';
    RAISE NOTICE '  ✓ Automatic timestamp updates';
    RAISE NOTICE '';
    RAISE NOTICE 'To verify setup, run: SELECT * FROM verify_database_setup();';
    RAISE NOTICE '====================================================================';
END $$;

-- Run verification function
SELECT * FROM verify_database_setup();