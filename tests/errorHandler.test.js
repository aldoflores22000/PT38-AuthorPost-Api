import { describe, expect, test } from "vitest";
import { resolveError } from "../src/middlewares/errorHandler.js";

/** Crea un error como los que devuelve la librería pg. */
const postgresError = (code, constraint) => Object.assign(new Error("detalle interno"), { code, constraint });

describe("resolveError", () => {
  test("traduce 23505 a 409", () => {
    expect(resolveError(postgresError("23505")).statusCode).toBe(409);
  });

  test("traduce 23503 a 400", () => {
    expect(resolveError(postgresError("23503")).statusCode).toBe(400);
  });

  test.each(["23502", "22P02", "22001", "22003"])("traduce %s a 400", (code) => {
    expect(resolveError(postgresError(code)).statusCode).toBe(400);
  });

  test("usa un mensaje específico para una restricción conocida", () => {
    expect(resolveError(postgresError("23505", "authors_email_key"))).toEqual({
      statusCode: 409,
      message: "El email ya está registrado",
    });
  });

  test.each([
    ["comments_post_id_fkey", "El post indicado no existe"],
    ["comments_author_id_fkey", "El autor indicado no existe"],
  ])("traduce la restricción %s", (constraint, message) => {
    expect(resolveError(postgresError("23503", constraint))).toEqual({ statusCode: 400, message });
  });

  test("no expone el mensaje original de PostgreSQL", () => {
    expect(resolveError(postgresError("23505")).message).not.toContain("detalle interno");
  });

  test("respeta el statusCode de los errores de la aplicación", () => {
    const error = Object.assign(new Error("No existe"), { statusCode: 404 });

    expect(resolveError(error)).toEqual({ statusCode: 404, message: "No existe" });
  });

  test("un error desconocido es un 500 con mensaje genérico", () => {
    expect(resolveError(new Error("detalle interno"))).toEqual({
      statusCode: 500,
      message: "Error interno del servidor",
    });
  });
});
