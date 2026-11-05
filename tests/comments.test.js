import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";
import { resetData, setupSchema } from "./helpers/db.js";

beforeAll(setupSchema);
beforeEach(resetData);
afterAll(() => pool.end());

describe("GET /comments", () => {
  test("devuelve todos los comentarios", async () => {
    const response = await request(app).get("/comments");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({
      id: 1,
      post_id: 1,
      author_id: 2,
      content: "Muy buen post",
    });
  });
});

describe("GET /posts/:postId/comments", () => {
  test("devuelve los comentarios del post", async () => {
    const response = await request(app).get("/posts/1/comments");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body.every((comment) => comment.post_id === 1)).toBe(true);
  });

  test("devuelve una lista vacía si el post no tiene comentarios", async () => {
    const response = await request(app).get("/posts/2/comments");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("responde 404 si el post no existe", async () => {
    const response = await request(app).get("/posts/999/comments");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Post no encontrado");
  });

  test("responde 400 si el postId no es válido", async () => {
    const response = await request(app).get("/posts/abc/comments");

    expect(response.statusCode).toBe(400);
  });
});

describe("POST /comments", () => {
  const validComment = { post_id: 2, author_id: 2, content: "Nuevo comentario" };

  test("crea el comentario y lo persiste", async () => {
    const response = await request(app).post("/comments").send(validComment);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({ id: 3, ...validComment });
    expect(response.body).toHaveProperty("created_at");

    const persisted = await request(app).get("/posts/2/comments");
    expect(persisted.body).toHaveLength(1);
  });

  test.each([
    ["sin post_id", { author_id: 1, content: "c" }, "post_id es requerido"],
    ["con post_id inválido", { post_id: "uno", author_id: 1, content: "c" }, "post_id"],
    ["sin author_id", { post_id: 1, content: "c" }, "author_id es requerido"],
    ["con author_id inválido", { post_id: 1, author_id: 0, content: "c" }, "author_id"],
    ["sin content", { post_id: 1, author_id: 1 }, "content es requerido"],
    ["con content vacío", { post_id: 1, author_id: 1, content: "  " }, "content no puede estar vacío"],
  ])("responde 400 %s", async (_caso, body, message) => {
    const response = await request(app).post("/comments").send(body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain(message);
  });

  test("responde 400 si no se envía cuerpo", async () => {
    const response = await request(app).post("/comments");

    expect(response.statusCode).toBe(400);
  });

  test("responde 400 si el post no existe (23503)", async () => {
    const response = await request(app)
      .post("/comments")
      .send({ ...validComment, post_id: 999 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El post indicado no existe");
  });

  test("responde 400 si el autor no existe (23503)", async () => {
    const response = await request(app)
      .post("/comments")
      .send({ ...validComment, author_id: 999 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El autor indicado no existe");
  });
});

describe("integridad referencial", () => {
  test("al borrar un post se borran sus comentarios", async () => {
    await request(app).delete("/posts/1");

    const comments = await request(app).get("/comments");
    expect(comments.body).toEqual([]);
  });

  test("al borrar un autor, sus comentarios en posts ajenos quedan sin autor", async () => {
    await request(app).delete("/authors/2");

    const comments = await request(app).get("/comments");
    expect(comments.body).toHaveLength(2);
    expect(comments.body[0]).toMatchObject({ id: 1, author_id: null, content: "Muy buen post" });
    expect(comments.body[1]).toMatchObject({ id: 2, author_id: 1 });
  });

  test("al borrar un autor, se borran los comentarios de sus posts", async () => {
    await request(app).delete("/authors/1");

    const comments = await request(app).get("/comments");
    expect(comments.body).toEqual([]);
  });
});
