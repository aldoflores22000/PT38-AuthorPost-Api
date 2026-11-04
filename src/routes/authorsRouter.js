import { Router } from "express";
import {
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
} from "../controllers/authorsController.js";
import { validateIdParam } from "../middlewares/validateIdParam.js";

const authorsRouter = Router();

authorsRouter.get("/", getAllAuthors);
authorsRouter.get("/:id", validateIdParam("id"), getAuthorById);
authorsRouter.post("/", createAuthor);
authorsRouter.put("/:id", validateIdParam("id"), updateAuthor);
authorsRouter.delete("/:id", validateIdParam("id"), deleteAuthor);

export default authorsRouter;
