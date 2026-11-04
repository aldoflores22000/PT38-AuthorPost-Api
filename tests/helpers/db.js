import { readFile } from "node:fs/promises";
import pool from "../../src/config/db.js";

/**
 * Crea las tablas en la base de datos de tests usando el mismo setup.sql de la aplicación.
 */
export async function setupSchema() {
  const sql = await readFile(new URL("../../src/db/setup.sql", import.meta.url), "utf8");
  await pool.query(sql);
}

/**
 * Deja la base de datos en un estado conocido: los autores 1 y 2, y los posts 1 y 2.
 * El autor 1 tiene los dos posts y el autor 2 no tiene ninguno.
 */
export async function resetData() {
  await pool.query("TRUNCATE posts, authors RESTART IDENTITY CASCADE");
  await pool.query(`
    INSERT INTO authors (name, email, bio) VALUES
      ('Ana García',  'ana@example.com',    'Full-stack dev'),
      ('Carlos Ruiz', 'carlos@example.com', NULL)
  `);
  await pool.query(`
    INSERT INTO posts (title, content, author_id, published) VALUES
      ('Primer post',  'Contenido uno', 1, TRUE),
      ('Segundo post', 'Contenido dos', 1, FALSE)
  `);
}
