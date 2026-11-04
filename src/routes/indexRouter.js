import { Router } from "express";
import authorsRouter from "./authorsRouter.js";
import postsRouter from "./postsRouter.js";

const router = Router();

router.use("/authors", authorsRouter);
router.use("/posts", postsRouter);

export default router;
