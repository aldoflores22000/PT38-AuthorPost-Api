import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";
import { resetData, setupSchema } from "./helpers/db.js";

beforeAll(setupSchema);
beforeEach(resetData);
afterAll(() => pool.end());

describe("GET /authors", () => {
  test("devuelve todos los autores", async () => {
    const response = await request(app).get("/authors");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({ id: 1, name: "Ana García" });
  });

  test("responde 500 sin exponer detalles si falla la base de datos", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const query = vi.spyOn(pool, "query").mockRejectedValueOnce(new Error("detalle secreto"));

    const response = await request(app).get("/authors");

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: "Error interno del servidor", status: 500 });

    query.mockRestore();
    consoleError.mockRestore();
  });
});

describe("GET /authors/:id", () => {
  test("devuelve el autor", async () => {
    const response = await request(app).get("/authors/1");

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ id: 1, email: "ana@example.com" });
  });

  test("responde 404 si no existe", async () => {
    const response = await request(app).get("/authors/999");

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Autor no encontrado");
  });

  test.each(["abc", "0", "-1", "1.5", "99999999999"])("responde 400 con el id %s", async (id) => {
    const response = await request(app).get(`/authors/${id}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain("entero positivo");
  });
});

describe("POST /authors", () => {
  test("crea el autor y lo persiste", async () => {
    const response = await request(app)
      .post("/authors")
      .send({ name: "María López", email: "maria@example.com", bio: "APIs REST" });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      id: 3,
      name: "María López",
      email: "maria@example.com",
      bio: "APIs REST",
    });
    expect(response.body).toHaveProperty("created_at");

    const persisted = await request(app).get("/authors/3");
    expect(persisted.body.email).toBe("maria@example.com");
  });

  test("bio es opcional", async () => {
    const response = await request(app)
      .post("/authors")
      .send({ name: "María", email: "maria@example.com" });

    expect(response.statusCode).toBe(201);
    expect(response.body.bio).toBeNull();
  });

  test.each([
    ["sin name", { email: "x@example.com" }, "name es requerido"],
    ["con name vacío", { name: "   ", email: "x@example.com" }, "name no puede estar vacío"],
    ["sin email", { name: "Juan" }, "email es requerido"],
    ["con email inválido", { name: "Juan", email: "no-es-email" }, "formato del email"],
    ["con bio que no es texto", { name: "Juan", email: "x@example.com", bio: 5 }, "bio"],
  ])("responde 400 %s", async (_caso, body, message) => {
    const response = await request(app).post("/authors").send(body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain(message);
  });

  test("responde 400 si no se envía cuerpo", async () => {
    const response = await request(app).post("/authors");

    expect(response.statusCode).toBe(400);
  });

  test("responde 400 si el JSON está mal formado", async () => {
    const response = await request(app)
      .post("/authors")
      .set("Content-Type", "application/json")
      .send('{"name": ');

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain("JSON");
  });

  test("responde 409 si el email ya existe (23505)", async () => {
    const response = await request(app)
      .post("/authors")
      .send({ name: "Otra Ana", email: "ana@example.com" });

    expect(response.statusCode).toBe(409);
    expect(response.body.error).toBe("El email ya está registrado");
  });

  test("el email duplicado se detecta sin distinguir mayúsculas", async () => {
    const response = await request(app)
      .post("/authors")
      .send({ name: "Otra Ana", email: "ANA@example.com" });

    expect(response.statusCode).toBe(409);
  });
});

describe("PUT /authors/:id", () => {
  test("actualiza el autor", async () => {
    const response = await request(app)
      .put("/authors/1")
      .send({ name: "Ana Actualizada", email: "ana.nueva@example.com", bio: "Nueva bio" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: 1,
      name: "Ana Actualizada",
      email: "ana.nueva@example.com",
      bio: "Nueva bio",
    });
  });

  test("puede conservar su propio email", async () => {
    const response = await request(app)
      .put("/authors/1")
      .send({ name: "Ana", email: "ana@example.com" });

    expect(response.statusCode).toBe(200);
  });

  test("responde 404 si no existe", async () => {
    const response = await request(app)
      .put("/authors/999")
      .send({ name: "Nadie", email: "nadie@example.com" });

    expect(response.statusCode).toBe(404);
  });

  test("responde 400 si faltan datos", async () => {
    const response = await request(app).put("/authors/1").send({ name: "Sin email" });

    expect(response.statusCode).toBe(400);
  });

  test("responde 409 si usa el email de otro autor", async () => {
    const response = await request(app)
      .put("/authors/2")
      .send({ name: "Carlos", email: "ana@example.com" });

    expect(response.statusCode).toBe(409);
  });
});

describe("DELETE /authors/:id", () => {
  test("elimina el autor y responde 204 sin cuerpo", async () => {
    const response = await request(app).delete("/authors/2");

    expect(response.statusCode).toBe(204);
    expect(response.text).toBe("");

    const deleted = await request(app).get("/authors/2");
    expect(deleted.statusCode).toBe(404);
  });

  test("elimina también sus posts en cascada", async () => {
    await request(app).delete("/authors/1");

    const posts = await request(app).get("/posts");
    expect(posts.body).toHaveLength(0);
  });

  test("responde 404 si no existe", async () => {
    const response = await request(app).delete("/authors/999");

    expect(response.statusCode).toBe(404);
  });
});
