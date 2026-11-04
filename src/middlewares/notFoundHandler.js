import { notFound } from "../utils/errors.js";

/**
 * Responde 404 en JSON cuando ninguna ruta coincide con la petición.
 */
export function notFoundHandler(req, res, next) {
  next(notFound(`Ruta no encontrada: ${req.method} ${req.path}`));
}
