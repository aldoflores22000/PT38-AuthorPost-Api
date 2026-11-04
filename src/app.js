import { fileURLToPath } from "node:url";
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import router from "./routes/indexRouter.js";

const app = express();

app.use(express.json());

// La ruta se calcula desde este archivo para que funcione desde cualquier directorio.
const swaggerDocument = YAML.load(fileURLToPath(new URL("./docs/openapi.yaml", import.meta.url)));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Permite comprobar que el servicio está activo, por ejemplo desde Railway.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(router);

// El orden importa: primero el 404 de rutas y al final el manejador global de errores.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
