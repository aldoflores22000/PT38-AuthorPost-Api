import { Router } from "express";
import authorsRouter from "./authorsRouter.js";
import commentsRouter from "./commentsRouter.js";
import postsRouter from "./postsRouter.js";

const router = Router();

router.use("/authors", authorsRouter);
router.use("/posts", postsRouter);
router.use("/comments", commentsRouter);

export default router;
