import pool from "../config/db.js";

/**
 * Obtiene todos los comentarios ordenados por id.
 * @returns {Promise<object[]>} Lista de comentarios.
 */
export const getAllCommentsService = async () => {
  const result = await pool.query("SELECT * FROM comments ORDER BY id");
  return result.rows;
};

/**
 * Obtiene los comentarios de un post.
 * @param {number|string} postId Id del post.
 * @returns {Promise<object[]>} Comentarios del post.
 */
export const getCommentsByPostService = async (postId) => {
  const result = await pool.query("SELECT * FROM comments WHERE post_id = $1 ORDER BY id", [postId]);
  return result.rows;
};

/**
 * Inserta un comentario nuevo.
 * @param {{post_id: number, author_id: number, content: string}} comment Datos del comentario.
 * @returns {Promise<object>} El comentario creado.
 */
export const createCommentService = async ({ post_id, author_id, content }) => {
  const result = await pool.query(
    "INSERT INTO comments (post_id, author_id, content) VALUES ($1, $2, $3) RETURNING *",
    [post_id, author_id, content],
  );
  return result.rows[0];
};
