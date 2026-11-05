import { Router } from "express";
import { createComment, getAllComments } from "../controllers/commentsController.js";

const commentsRouter = Router();

commentsRouter.get("/", getAllComments);
commentsRouter.post("/", createComment);

export default commentsRouter;
