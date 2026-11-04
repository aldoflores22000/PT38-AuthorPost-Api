import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";
import { resetData, setupSchema } from "./helpers/db.js";

beforeAll(setupSchema);
beforeEach(resetData);
afterAll(() => pool.end());

describe("GET /posts", () => {
  test("devuelve todos los posts", async () => {
    const response = await request(app).get("/posts");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({ id: 1, title: "Primer post", author_id: 1 });
  });
});

describe("GET /posts/:id", () => {
  test("devuelve el post", async () => {
    const response = await request(app).get("/posts/2");

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ id: 2, title: "Segundo post", published: false });
  });

  test("responde 404 si no existe", async () => {
    const response = await request(app).get("/posts/999");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Post no encontrado");
  });

  test("responde 400 si el id no es válido", async () => {
    const response = await request(app).get("/posts/abc");

    expect(response.statusCode).toBe(400);
  });
});

describe("GET /posts/author/:authorId", () => {
  test("devuelve los posts con el detalle de su autor", async () => {
    const response = await request(app).get("/posts/author/1");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({
      title: "Primer post",
      author: { id: 1, name: "Ana García", email: "ana@example.com", bio: "Full-stack dev" },
    });
  });

  test("devuelve una lista vacía si el autor no tiene posts", async () => {
    const response = await request(app).get("/posts/author/2");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("responde 404 si el autor no existe", async () => {
    const response = await request(app).get("/posts/author/999");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Autor no encontrado");
  });

  test("responde 400 si el authorId no es válido", async () => {
    const response = await request(app).get("/posts/author/abc");

    expect(response.statusCode).toBe(400);
  });
});

describe("POST /posts", () => {
  const validPost = { title: "Nuevo", content: "Contenido", author_id: 2 };

  test("crea el post y lo persiste", async () => {
    const response = await request(app)
      .post("/posts")
      .send({ ...validPost, published: true });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({ id: 3, ...validPost, published: true });

    const persisted = await request(app).get("/posts/3");
    expect(persisted.body.title).toBe("Nuevo");
  });

  test("published es false por defecto", async () => {
    const response = await request(app).post("/posts").send(validPost);

    expect(response.statusCode).toBe(201);
    expect(response.body.published).toBe(false);
  });

  test.each([
    ["sin title", { content: "c", author_id: 1 }, "title es requerido"],
    ["con title vacío", { title: " ", content: "c", author_id: 1 }, "title no puede estar vacío"],
    ["con title muy largo", { title: "x".repeat(201), content: "c", author_id: 1 }, "200"],
    ["sin content", { title: "t", author_id: 1 }, "content es requerido"],
    ["con content vacío", { title: "t", content: "", author_id: 1 }, "content no puede estar vacío"],
    ["sin author_id", { title: "t", content: "c" }, "author_id es requerido"],
    ["con author_id no numérico", { title: "t", content: "c", author_id: "uno" }, "author_id"],
    ["con published inválido", { title: "t", content: "c", author_id: 1, published: "sí" }, "published"],
  ])("responde 400 %s", async (_caso, body, message) => {
    const response = await request(app).post("/posts").send(body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain(message);
  });

  test("responde 400 si el autor no existe (23503)", async () => {
    const response = await request(app)
      .post("/posts")
      .send({ ...validPost, author_id: 999 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El autor indicado no existe");
  });
});

describe("PUT /posts/:id", () => {
  test("actualiza el post", async () => {
    const response = await request(app)
      .put("/posts/1")
      .send({ title: "Editado", content: "Editado", author_id: 2, published: false });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: 1,
      title: "Editado",
      author_id: 2,
      published: false,
    });
  });

  test("responde 404 si no existe", async () => {
    const response = await request(app)
      .put("/posts/999")
      .send({ title: "t", content: "c", author_id: 1 });

    expect(response.statusCode).toBe(404);
  });

  test("responde 400 si faltan datos", async () => {
    const response = await request(app).put("/posts/1").send({ title: "Solo título" });

    expect(response.statusCode).toBe(400);
  });

  test("responde 400 si el autor no existe (23503)", async () => {
    const response = await request(app)
      .put("/posts/1")
      .send({ title: "t", content: "c", author_id: 999 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El autor indicado no existe");
  });
});

describe("DELETE /posts/:id", () => {
  test("elimina el post y responde 204 sin cuerpo", async () => {
    const response = await request(app).delete("/posts/1");

    expect(response.statusCode).toBe(204);
    expect(response.text).toBe("");

    const deleted = await request(app).get("/posts/1");
    expect(deleted.statusCode).toBe(404);
  });

  test("responde 404 si no existe", async () => {
    const response = await request(app).delete("/posts/999");

    expect(response.statusCode).toBe(404);
  });
});
