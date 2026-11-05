import { Router } from "express";
import { getCommentsByPost } from "../controllers/commentsController.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  getPostsByAuthor,
  updatePost,
} from "../controllers/postsController.js";
import { validateIdParam } from "../middlewares/validateIdParam.js";

const postsRouter = Router();

postsRouter.get("/", getAllPosts);
postsRouter.get("/author/:authorId", validateIdParam("authorId"), getPostsByAuthor);
postsRouter.get("/:postId/comments", validateIdParam("postId"), getCommentsByPost);
postsRouter.get("/:id", validateIdParam("id"), getPostById);
postsRouter.post("/", createPost);
postsRouter.put("/:id", validateIdParam("id"), updatePost);
postsRouter.delete("/:id", validateIdParam("id"), deletePost);

export default postsRouter;
