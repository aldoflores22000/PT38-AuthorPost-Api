import {
  createAuthorService,
  deleteAuthorService,
  getAllAuthorsService,
  getAuthorByIdService,
  updateAuthorService,
} from "../services/authorsService.js";
import { badRequest, notFound } from "../utils/errors.js";
import { validarAuthor } from "../utils/validators.js";

// Express 5 envía al errorHandler los errores de los controladores async,
// por eso aquí no hace falta try/catch.

/**
 * Normaliza un cuerpo ya validado antes de guardarlo.
 * El email va en minúsculas para que la restricción UNIQUE no distinga mayúsculas.
 * @param {{name: string, email: string, bio?: string|null}} body Cuerpo de la petición.
 * @returns {{name: string, email: string, bio: string|null}} Datos listos para el servicio.
 */
const toAuthorData = ({ name, email, bio }) => ({
  name: name.trim(),
  email: email.toLowerCase(),
  bio: bio ?? null,
});

/** GET /authors: responde 200 con la lista de autores. */
export const getAllAuthors = async (req, res) => {
  const authors = await getAllAuthorsService();
  res.status(200).json(authors);
};

/** GET /authors/:id: responde 200 con el autor, o 404 si no existe. */
export const getAuthorById = async (req, res, next) => {
  const author = await getAuthorByIdService(req.params.id);
  if (!author) return next(notFound("Autor no encontrado"));

  res.status(200).json(author);
};

/** POST /authors: valida el cuerpo y responde 201 con el autor creado. */
export const createAuthor = async (req, res, next) => {
  const error = validarAuthor(req.body);
  if (error) return next(badRequest(error));

  const author = await createAuthorService(toAuthorData(req.body));
  res.status(201).json(author);
};

/** PUT /authors/:id: reemplaza el autor y responde 200, o 404 si no existe. */
export const updateAuthor = async (req, res, next) => {
  const error = validarAuthor(req.body);
  if (error) return next(badRequest(error));

  const author = await updateAuthorService(req.params.id, toAuthorData(req.body));
  if (!author) return next(notFound("Autor no encontrado"));

  res.status(200).json(author);
};

/** DELETE /authors/:id: elimina el autor y responde 204, o 404 si no existe. */
export const deleteAuthor = async (req, res, next) => {
  const deleted = await deleteAuthorService(req.params.id);
  if (!deleted) return next(notFound("Autor no encontrado"));

  res.status(204).send();
};
