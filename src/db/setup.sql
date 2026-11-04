-- Crea el esquema. Se puede ejecutar varias veces sin perder datos.

CREATE TABLE IF NOT EXISTS authors (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  bio        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Relación 1:N: un autor tiene muchos posts. Al borrar un autor se borran sus posts.
CREATE TABLE IF NOT EXISTS posts (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  content    TEXT NOT NULL,
  author_id  INTEGER NOT NULL,
  published  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

-- Acelera GET /posts/author/:authorId.
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
