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
