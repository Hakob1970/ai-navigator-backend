CREATE TABLE IF NOT EXISTS writer_projects (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
