-- Carga datos de ejemplo. Se puede ejecutar varias veces sin duplicar registros.

INSERT INTO authors (name, email, bio) VALUES
  ('Ana García',   'ana@example.com',    'Desarrolladora full-stack'),
  ('Carlos Ruiz',  'carlos@example.com', 'Escritor técnico'),
  ('María López',  'maria@example.com',  'Ingeniería de APIs REST')
ON CONFLICT (email) DO NOTHING;

-- Cada post busca a su autor por email, porque el id puede variar entre bases de datos.
INSERT INTO posts (title, content, author_id, published)
SELECT v.title, v.content, a.id, v.published
FROM (VALUES
  (1, 'Introducción a Node.js',       'Node.js es un runtime...', 'ana@example.com',    TRUE),
  (2, 'PostgreSQL vs MySQL',          'Ambas tienen ventajas...', 'carlos@example.com', TRUE),
  (3, 'APIs RESTful',                 'REST es un estilo...',     'ana@example.com',    TRUE),
  (4, 'Manejo de errores en Express', 'El manejo apropiado...',   'maria@example.com',  FALSE),
  (5, 'Async/Await explicado',        'Las promesas...',          'ana@example.com',    FALSE)
) AS v(position, title, content, email, published)
JOIN authors a ON a.email = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM posts p WHERE p.title = v.title AND p.author_id = a.id
)
ORDER BY v.position;

-- Cada comentario busca su post por título y su autor por email.
INSERT INTO comments (post_id, author_id, content)
SELECT p.id, a.id, v.content
FROM (VALUES
  (1, 'Introducción a Node.js', 'carlos@example.com', 'Muy buena introducción, gracias.'),
  (2, 'Introducción a Node.js', 'maria@example.com',  '¿Harás una segunda parte?'),
  (3, 'PostgreSQL vs MySQL',    'ana@example.com',    'Yo también prefiero PostgreSQL.')
) AS v(position, post_title, email, content)
JOIN posts p ON p.title = v.post_title
JOIN authors a ON a.email = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM comments c
  WHERE c.post_id = p.id AND c.author_id = a.id AND c.content = v.content
)
ORDER BY v.position;
