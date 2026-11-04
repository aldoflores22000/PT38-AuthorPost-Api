import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Los tests de integración comparten una misma base de datos y la limpian
    // antes de cada test, así que los archivos deben correr uno a la vez.
    fileParallelism: false,
  },
});
