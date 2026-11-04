import pool from "../config/db.js";

/**
 * Comprueba que la aplicación puede conectarse a PostgreSQL
 * y muestra la hora del servidor de base de datos.
 */
async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Conexión correcta. Hora del servidor:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Error conectando:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testConnection();
