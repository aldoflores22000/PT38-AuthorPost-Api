import pool from "../config/db.js";

/**
 * Obtiene todos los posts ordenados por id.
 * @returns {Promise<object[]>} Lista de posts.
 */
export const getAllPostsService = async () => {
  const result = await pool.query("SELECT * FROM posts ORDER BY id");
  return result.rows;
};

/**
 * Busca un post por su id.
 * @param {number|string} id Id del post.
 * @returns {Promise<object|null>} El post, o null si no existe.
 */
export const getPostByIdService = async (id) => {
  const result = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
  return result.rows[0] ?? null;
};

/**
 * Obtiene los posts de un autor, cada uno con los datos de su autor incluidos.
 * @param {number|string} authorId Id del autor.
 * @returns {Promise<object[]>} Posts del autor, con una propiedad `author`.
 */
export const getPostsByAuthorService = async (authorId) => {
  const result = await pool.query(
    `SELECT p.*,
            json_build_object('id', a.id, 'name', a.name, 'email', a.email, 'bio', a.bio) AS author
     FROM posts p
     JOIN authors a ON a.id = p.author_id
     WHERE p.author_id = $1
     ORDER BY p.id`,
    [authorId],
  );
  return result.rows;
};

/**
 * Inserta un post nuevo.
 * @param {{title: string, content: string, author_id: number, published: boolean}} post Datos del post.
 * @returns {Promise<object>} El post creado.
 */
export const createPostService = async ({ title, content, author_id, published }) => {
  const result = await pool.query(
    `INSERT INTO posts (title, content, author_id, published)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, content, author_id, published],
  );
  return result.rows[0];
};

/**
 * Reemplaza los datos de un post.
 * @param {number|string} id Id del post.
 * @param {{title: string, content: string, author_id: number, published: boolean}} post Datos nuevos.
 * @returns {Promise<object|null>} El post actualizado, o null si no existe.
 */
export const updatePostService = async (id, { title, content, author_id, published }) => {
  const result = await pool.query(
    `UPDATE posts
     SET title = $1, content = $2, author_id = $3, published = $4
     WHERE id = $5
     RETURNING *`,
    [title, content, author_id, published, id],
  );
  return result.rows[0] ?? null;
};

/**
 * Elimina un post.
 * @param {number|string} id Id del post.
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
export const deletePostService = async (id) => {
  const result = await pool.query("DELETE FROM posts WHERE id = $1", [id]);
  return result.rowCount > 0;
};
