import { readFile } from "node:fs/promises";
import pool from "../config/db.js";

/**
 * Ejecuta un script SQL de esta carpeta usando la conexión de la aplicación.
 * Permite preparar la base de datos con `npm run db:setup` y `npm run db:seed`
 * sin necesidad de tener psql instalado.
 * @param {string} fileName Nombre del archivo, por ejemplo "setup.sql".
 */
async function runSqlFile(fileName) {
  try {
    const sql = await readFile(new URL(fileName, import.meta.url), "utf8");
    await pool.query(sql);
    console.log(`✅ ${fileName} ejecutado correctamente`);
  } catch (error) {
    console.error(`❌ Error ejecutando ${fileName}:`, error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runSqlFile(process.argv[2]);
