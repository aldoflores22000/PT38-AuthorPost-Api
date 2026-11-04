import pool from "../config/db.js";

/**
 * Obtiene todos los autores ordenados por id.
 * @returns {Promise<object[]>} Lista de autores.
 */
export const getAllAuthorsService = async () => {
  const result = await pool.query("SELECT * FROM authors ORDER BY id");
  return result.rows;
};

/**
 * Busca un autor por su id.
 * @param {number|string} id Id del autor.
 * @returns {Promise<object|null>} El autor, o null si no existe.
 */
export const getAuthorByIdService = async (id) => {
  const result = await pool.query("SELECT * FROM authors WHERE id = $1", [id]);
  return result.rows[0] ?? null;
};

/**
 * Inserta un autor nuevo.
 * @param {{name: string, email: string, bio: string|null}} author Datos del autor.
 * @returns {Promise<object>} El autor creado.
 */
export const createAuthorService = async ({ name, email, bio }) => {
  const result = await pool.query(
    "INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING *",
    [name, email, bio],
  );
  return result.rows[0];
};

/**
 * Reemplaza los datos de un autor.
 * @param {number|string} id Id del autor.
 * @param {{name: string, email: string, bio: string|null}} author Datos nuevos.
 * @returns {Promise<object|null>} El autor actualizado, o null si no existe.
 */
export const updateAuthorService = async (id, { name, email, bio }) => {
  const result = await pool.query(
    "UPDATE authors SET name = $1, email = $2, bio = $3 WHERE id = $4 RETURNING *",
    [name, email, bio, id],
  );
  return result.rows[0] ?? null;
};

/**
 * Elimina un autor. Sus posts se borran en cascada por la clave foránea.
 * @param {number|string} id Id del autor.
 * @returns {Promise<boolean>} true si se eliminó, false si no existía.
 */
export const deleteAuthorService = async (id) => {
  const result = await pool.query("DELETE FROM authors WHERE id = $1", [id]);
  return result.rowCount > 0;
};
