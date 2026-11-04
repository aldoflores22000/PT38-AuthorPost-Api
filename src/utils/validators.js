// Cada validador devuelve un mensaje de error, o null si el valor es válido.

const MAX_POSTGRES_INTEGER = 2147483647;

/**
 * Valida un texto obligatorio: debe ser string, no estar vacío y respetar el largo máximo.
 * @param {*} value Valor a validar.
 * @param {string} field Nombre del campo, usado en el mensaje.
 * @param {number} [maxLength] Largo máximo permitido.
 * @returns {string|null} Mensaje de error o null.
 */
export function validarTextoRequerido(value, field, maxLength) {
  if (value === undefined || value === null) return `${field} es requerido`;
  if (typeof value !== "string") return `${field} debe ser un texto`;
  if (value.trim().length === 0) return `${field} no puede estar vacío`;
  if (maxLength && value.trim().length > maxLength) {
    return `${field} no puede superar los ${maxLength} caracteres`;
  }
  return null;
}

/**
 * Valida que el email exista, sea un texto y tenga un formato correcto.
 * @param {*} email Valor a validar.
 * @returns {string|null} Mensaje de error o null.
 */
export function validarEmail(email) {
  if (email === undefined || email === null || email === "") return "email es requerido";
  if (typeof email !== "string") return "email debe ser un texto";
  if (email.length > 150) return "email no puede superar los 150 caracteres";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "El formato del email es inválido";
  return null;
}

/**
 * Valida que un id recibido en la URL sea un entero positivo que PostgreSQL pueda guardar.
 * @param {string} id Valor del parámetro de ruta.
 * @returns {string|null} Mensaje de error o null.
 */
export function validarIdParam(id) {
  const esEnteroPositivo = /^[1-9]\d*$/.test(id) && Number(id) <= MAX_POSTGRES_INTEGER;
  return esEnteroPositivo ? null : "El id debe ser un entero positivo";
}

/**
 * Valida el cuerpo usado para crear o actualizar un autor.
 * @param {object} [body] Cuerpo de la petición.
 * @returns {string|null} Primer error encontrado o null.
 */
export function validarAuthor({ name, email, bio } = {}) {
  const errorName = validarTextoRequerido(name, "name", 100);
  if (errorName) return errorName;

  const errorEmail = validarEmail(email);
  if (errorEmail) return errorEmail;

  if (bio !== undefined && bio !== null && typeof bio !== "string") {
    return "bio debe ser un texto";
  }
  return null;
}

/**
 * Valida el cuerpo usado para crear o actualizar un post.
 * @param {object} [body] Cuerpo de la petición.
 * @returns {string|null} Primer error encontrado o null.
 */
export function validarPost({ title, content, author_id, published } = {}) {
  const errorTitle = validarTextoRequerido(title, "title", 200);
  if (errorTitle) return errorTitle;

  const errorContent = validarTextoRequerido(content, "content");
  if (errorContent) return errorContent;

  if (author_id === undefined || author_id === null || author_id === "") {
    return "author_id es requerido";
  }
  if (!Number.isInteger(author_id) || author_id < 1 || author_id > MAX_POSTGRES_INTEGER) {
    return "author_id debe ser un entero positivo";
  }

  if (published !== undefined && typeof published !== "boolean") {
    return "published debe ser true o false";
  }
  return null;
}
