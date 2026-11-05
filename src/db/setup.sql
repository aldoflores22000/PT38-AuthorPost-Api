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

-- Un comentario pertenece a un post y a un autor.
-- Al borrar el post se borran sus comentarios. Al borrar el autor, sus comentarios
-- en posts ajenos se conservan sin autor, para no romper la conversación.
CREATE TABLE IF NOT EXISTS comments (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER NOT NULL,
  author_id  INTEGER,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL
);

-- Aceleran GET /posts/:postId/comments y el borrado de autores.
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
