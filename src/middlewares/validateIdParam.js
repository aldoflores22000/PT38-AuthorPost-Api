import { badRequest } from "../utils/errors.js";
import { validarIdParam } from "../utils/validators.js";

/**
 * Crea un middleware que rechaza con 400 un id de la URL que no sea válido,
 * antes de que la petición llegue al controlador y a la base de datos.
 * @param {string} paramName Nombre del parámetro de ruta, por ejemplo "id".
 * @returns {import("express").RequestHandler} Middleware de validación.
 */
export function validateIdParam(paramName) {
  return (req, res, next) => {
    const error = validarIdParam(req.params[paramName]);
    next(error ? badRequest(error) : undefined);
  };
}
