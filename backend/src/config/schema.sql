-- ScholarStream Database Schema
-- Run this script to create all necessary tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE,
    college_name VARCHAR(255),
    country VARCHAR(255),
    ssn VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
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
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('reaction', 'comment', 'save', 'share')),
    comment_text TEXT,
    parent_comment_id INTEGER REFERENCES paper_interactions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create partial unique constraint that allows multiple comments but keeps uniqueness for other interaction types
CREATE UNIQUE INDEX IF NOT EXISTS unique_paper_user_non_comment_interaction 
ON paper_interactions(paper_id, user_id, interaction_type) 
WHERE interaction_type != 'comment';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_papers_status ON papers(status);
CREATE INDEX IF NOT EXISTS idx_papers_category ON papers(category_id);
CREATE INDEX IF NOT EXISTS idx_papers_author ON papers(author_id);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at);
CREATE INDEX IF NOT EXISTS idx_paper_interactions_paper ON paper_interactions(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_interactions_user ON paper_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_interactions_type ON paper_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_paper_interactions_parent_comment_id ON paper_interactions(parent_comment_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for papers table
CREATE TRIGGER update_papers_updated_at BEFORE UPDATE ON papers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (id, name, description, image_url, image_hint) VALUES
('computer-science', 'Computer Science', 'Computing, algorithms, software engineering, AI, machine learning', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400', 'Computer and code on screen'),
('mathematics', 'Mathematics', 'Pure and applied mathematics, statistics, mathematical modeling', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400', 'Mathematical equations on blackboard'),
('physics', 'Physics', 'Theoretical and experimental physics, quantum mechanics, relativity', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400', 'Physics equations and diagrams'),
('chemistry', 'Chemistry', 'Organic, inorganic, physical chemistry, biochemistry', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', 'Laboratory equipment and molecules'),
('biology', 'Biology', 'Molecular biology, genetics, ecology, medical research', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', 'DNA and biological structures'),
('engineering', 'Engineering', 'Civil, mechanical, electrical, software engineering', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', 'Engineering blueprints and tools'),
('medicine', 'Medicine', 'Clinical research, medical studies, healthcare innovations', 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400', 'Medical equipment and research'),
('psychology', 'Psychology', 'Cognitive science, behavioral studies, mental health research', 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400', 'Brain scan and psychology concepts')
ON CONFLICT (id) DO NOTHING;

-- Insert default admin user (password: admin123 - change in production!)
INSERT INTO users (email, username, password, first_name, last_name, full_name, role) VALUES
('admin@papers.com', 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsKkCjVWi', 'Admin', 'User', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;
