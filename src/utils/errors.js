/**
 * Crea un error con el código HTTP que debe devolver la API.
 * @param {string} message Mensaje para el cliente.
 * @param {number} statusCode Código de estado HTTP.
 * @returns {Error} Error listo para enviarse al middleware global.
 */
export function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/** Crea un error 400: la petición tiene datos inválidos. */
export const badRequest = (message) => createError(message, 400);

/** Crea un error 404: el recurso no existe. */
export const notFound = (message) => createError(message, 404);
