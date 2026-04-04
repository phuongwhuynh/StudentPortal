CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE user_role AS ENUM ('guest', 'student', 'staff');
CREATE TYPE content_type AS ENUM ('forum', 'announcement', 'question');
CREATE TYPE question_status AS ENUM ('open', 'completed', 'cancelled');

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE forums (
  id UUID PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,
  body_embedding VECTOR(768),
  category VARCHAR(120) NOT NULL,
  posted_by UUID NOT NULL REFERENCES users(id),
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,
  body_embedding VECTOR(768),
  category VARCHAR(120) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'info',
  posted_by UUID NOT NULL REFERENCES users(id),
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

CREATE TABLE questions (
  id UUID PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,
  body_embedding VECTOR(768),
  category VARCHAR(120) NOT NULL,
  status question_status NOT NULL DEFAULT 'open',
  posted_by UUID NOT NULL REFERENCES users(id),
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY,
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  body_embedding VECTOR(768),
  posted_by UUID NOT NULL REFERENCES users(id),
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

CREATE TABLE reactions (
  id UUID PRIMARY KEY,
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (content_type, content_id, user_id)
);

CREATE TABLE content_views (
  id UUID PRIMARY KEY,
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_forums_created_at ON forums(created_at DESC);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_comments_content ON comments(content_type, content_id);
CREATE INDEX idx_reactions_content ON reactions(content_type, content_id);
CREATE INDEX idx_views_content ON content_views(content_type, content_id);

-- Vector indexes for semantic search. HNSW works well for retrieval quality/speed.
CREATE INDEX idx_forums_body_embedding_hnsw
  ON forums USING hnsw (body_embedding vector_cosine_ops);

CREATE INDEX idx_announcements_body_embedding_hnsw
  ON announcements USING hnsw (body_embedding vector_cosine_ops);

CREATE INDEX idx_questions_body_embedding_hnsw
  ON questions USING hnsw (body_embedding vector_cosine_ops);

CREATE INDEX idx_comments_body_embedding_hnsw
  ON comments USING hnsw (body_embedding vector_cosine_ops);
