import {
  createCommentService,
  getAllCommentsService,
  getCommentsByPostService,
} from "../services/commentsService.js";
import { getPostByIdService } from "../services/postsService.js";
import { badRequest, notFound } from "../utils/errors.js";
import { validarComment } from "../utils/validators.js";

/** GET /comments: responde 200 con la lista de comentarios. */
export const getAllComments = async (req, res) => {
  const comments = await getAllCommentsService();
  res.status(200).json(comments);
};

/**
 * GET /posts/:postId/comments: responde 200 con los comentarios del post.
 * Responde 404 si el post no existe, y una lista vacía si existe pero no tiene comentarios.
 */
export const getCommentsByPost = async (req, res, next) => {
  const post = await getPostByIdService(req.params.postId);
  if (!post) return next(notFound("Post no encontrado"));

  const comments = await getCommentsByPostService(req.params.postId);
  res.status(200).json(comments);
};

/**
 * POST /comments: valida el cuerpo y responde 201 con el comentario creado.
 * Si el post o el autor no existen, la clave foránea falla y el errorHandler responde 400.
 */
export const createComment = async (req, res, next) => {
  const error = validarComment(req.body);
  if (error) return next(badRequest(error));

  const { post_id, author_id, content } = req.body;
  const comment = await createCommentService({ post_id, author_id, content: content.trim() });
  res.status(201).json(comment);
};
