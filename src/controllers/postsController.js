import { getAuthorByIdService } from "../services/authorsService.js";
import {
  createPostService,
  deletePostService,
  getAllPostsService,
  getPostByIdService,
  getPostsByAuthorService,
  updatePostService,
} from "../services/postsService.js";
import { badRequest, notFound } from "../utils/errors.js";
import { validarPost } from "../utils/validators.js";

/**
 * Normaliza un cuerpo ya validado antes de guardarlo.
 * @param {{title: string, content: string, author_id: number, published?: boolean}} body Cuerpo de la petición.
 * @returns {{title: string, content: string, author_id: number, published: boolean}} Datos listos para el servicio.
 */
const toPostData = ({ title, content, author_id, published }) => ({
  title: title.trim(),
  content: content.trim(),
  author_id,
  published: published ?? false,
});

/** GET /posts: responde 200 con la lista de posts. */
export const getAllPosts = async (req, res) => {
  const posts = await getAllPostsService();
  res.status(200).json(posts);
};

/** GET /posts/:id: responde 200 con el post, o 404 si no existe. */
export const getPostById = async (req, res, next) => {
  const post = await getPostByIdService(req.params.id);
  if (!post) return next(notFound("Post no encontrado"));

  res.status(200).json(post);
};

/**
 * GET /posts/author/:authorId: responde 200 con los posts del autor y sus datos.
 * Responde 404 si el autor no existe, y una lista vacía si existe pero no tiene posts.
 */
export const getPostsByAuthor = async (req, res, next) => {
  const author = await getAuthorByIdService(req.params.authorId);
  if (!author) return next(notFound("Autor no encontrado"));

  const posts = await getPostsByAuthorService(req.params.authorId);
  res.status(200).json(posts);
};

/** POST /posts: valida el cuerpo y responde 201 con el post creado. */
export const createPost = async (req, res, next) => {
  const error = validarPost(req.body);
  if (error) return next(badRequest(error));

  const post = await createPostService(toPostData(req.body));
  res.status(201).json(post);
};

/** PUT /posts/:id: reemplaza el post y responde 200, o 404 si no existe. */
export const updatePost = async (req, res, next) => {
  const error = validarPost(req.body);
  if (error) return next(badRequest(error));

  const post = await updatePostService(req.params.id, toPostData(req.body));
  if (!post) return next(notFound("Post no encontrado"));

  res.status(200).json(post);
};

/** DELETE /posts/:id: elimina el post y responde 204, o 404 si no existe. */
export const deletePost = async (req, res, next) => {
  const deleted = await deletePostService(req.params.id);
  if (!deleted) return next(notFound("Post no encontrado"));

  res.status(204).send();
};
