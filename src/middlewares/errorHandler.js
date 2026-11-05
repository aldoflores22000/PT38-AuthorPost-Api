// Traducción de códigos de error de PostgreSQL a respuestas HTTP.
const POSTGRES_ERRORS = {
  23505: { statusCode: 409, message: "Ya existe un registro con ese valor único" },
  23503: { statusCode: 400, message: "La referencia a otro registro no es válida" },
  23502: { statusCode: 400, message: "Falta un campo obligatorio" },
  "22P02": { statusCode: 400, message: "Un valor tiene un formato inválido" },
  22001: { statusCode: 400, message: "Un valor supera el largo permitido" },
  22003: { statusCode: 400, message: "Un valor numérico está fuera de rango" },
};

// Mensajes más claros para restricciones concretas del esquema.
const CONSTRAINT_MESSAGES = {
  authors_email_key: "El email ya está registrado",
  posts_author_id_fkey: "El autor indicado no existe",
  comments_post_id_fkey: "El post indicado no existe",
  comments_author_id_fkey: "El autor indicado no existe",
};

/**
 * Convierte cualquier error en un código HTTP y un mensaje seguro para el cliente.
 * Los errores 500 usan un mensaje genérico para no exponer detalles internos.
 * @param {Error & {code?: string, constraint?: string, statusCode?: number, status?: number}} err
 * @returns {{statusCode: number, message: string}} Código y mensaje de la respuesta.
 */
export function resolveError(err) {
  const postgresError = POSTGRES_ERRORS[err.code];
  if (postgresError) {
    return {
      statusCode: postgresError.statusCode,
      message: CONSTRAINT_MESSAGES[err.constraint] ?? postgresError.message,
    };
  }

  // express.json() marca así un cuerpo con JSON mal formado.
  if (err.type === "entity.parse.failed") {
    return { statusCode: 400, message: "El cuerpo de la petición no es un JSON válido" };
  }

  const statusCode = err.statusCode ?? err.status ?? 500;
  if (statusCode >= 500) {
    return { statusCode, message: "Error interno del servidor" };
  }
  return { statusCode, message: err.message };
}

/**
 * Middleware global de errores: es el único punto donde se responden errores.
 * Express exige sus cuatro parámetros para reconocerlo como manejador de errores.
 */
export function errorHandler(err, req, res, next) {
  const { statusCode, message } = resolveError(err);

  // Solo se registran los fallos del servidor; un 4xx es un error del cliente.
  if (statusCode >= 500) {
    console.error("❌ Error capturado:", {
      status: statusCode,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      error: err,
    });
  }

  res.status(statusCode).json({ error: message, status: statusCode });
}
