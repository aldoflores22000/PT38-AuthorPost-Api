import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ quiet: true });

/**
 * Elige la cadena de conexión según el entorno.
 * Vitest define NODE_ENV=test, y en ese caso se exige una base de datos propia
 * para que limpiar las tablas en los tests nunca borre los datos reales.
 * @returns {string} Cadena de conexión a PostgreSQL.
 * @throws {Error} Si falta la variable o si la base de tests es la de la aplicación.
 */
function getConnectionString() {
  const { NODE_ENV, DATABASE_URL, TEST_DATABASE_URL } = process.env;

  if (NODE_ENV === "test") {
    if (!TEST_DATABASE_URL) {
      throw new Error("Falta TEST_DATABASE_URL: los tests necesitan su propia base de datos");
    }
    if (TEST_DATABASE_URL === DATABASE_URL) {
      throw new Error("TEST_DATABASE_URL debe ser distinta de DATABASE_URL");
    }
    return TEST_DATABASE_URL;
  }

  if (!DATABASE_URL) {
    throw new Error("Falta DATABASE_URL: copia .env.example a .env y complétalo");
  }
  return DATABASE_URL;
}

// Pool único y compartido por toda la aplicación.
const pool = new Pool({
  connectionString: getConnectionString(),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Evita que el proceso se caiga si se corta una conexión inactiva del pool.
pool.on("error", (error) => {
  console.error("Error en una conexión inactiva de PostgreSQL:", error.message);
});

export default pool;
